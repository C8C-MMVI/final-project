<?php
/**
 * api/forgot_password.php
 *
 * Accepts POST { email }
 * Looks up the user, inserts a reset token, and sends a reset email via SMTP.
 * SMTP settings come from environment variables injected by Docker Compose.
 *
 * In dev: emails are caught by MailHog at http://localhost:8025
 * In prod: swap MAIL_HOST/PORT to smtp.gmail.com/587 and set real credentials.
 */

ini_set('display_errors', 0);
error_reporting(E_ALL);
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

require_once __DIR__ . '/../db_config.php';

$data  = json_decode(file_get_contents('php://input'), true);
$email = trim($data['email'] ?? '');

// Always return success to prevent email enumeration
function respond_ok() {
    http_response_code(200);
    echo json_encode(['success' => true]);
    exit;
}

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'A valid email address is required.']);
    exit;
}

try {
    // ✅ column is `id`, not `user_id`
    $stmt = $pdo->prepare("SELECT user_id FROM users WHERE email = ? AND status = 'active' LIMIT 1");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
} catch (PDOException $e) {
    error_log('forgot_password lookup failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'A server error occurred.']);
    exit;
}

// User not found — still respond success (prevents email enumeration)
if (!$user) {
    respond_ok();
}

try {
    // Invalidate any existing unused tokens for this user
    $pdo->prepare("UPDATE password_resets SET used = true WHERE user_id = ? AND used = false")
        ->execute([$user['user_id']]);

    // Generate a secure random token
    $rawToken  = bin2hex(random_bytes(32)); // 64-char hex
    $expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour'));

    // ✅ uses `token` column (not `token_hash`)
    $pdo->prepare(
        "INSERT INTO password_resets (user_id, token, expires_at, used) VALUES (?, ?, ?, false)"
    )->execute([$user['user_id'], $rawToken, $expiresAt]);

} catch (PDOException $e) {
    error_log('forgot_password insert failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'A server error occurred.']);
    exit;
}

// ── Build reset link ──────────────────────────────────────────────────────────
$appUrl    = rtrim(getenv('APP_URL') ?: 'http://localhost:5173', '/');
$resetLink = "$appUrl/reset-password?token=$rawToken";

// ── Read SMTP settings from Docker env vars ───────────────────────────────────
$smtpHost = getenv('MAIL_HOST')      ?: 'mailhog';
$smtpPort = (int)(getenv('MAIL_PORT') ?: 1025);
$smtpUser = getenv('MAIL_USERNAME')  ?: '';
$smtpPass = getenv('MAIL_PASSWORD')  ?: '';
$fromAddr = getenv('MAIL_FROM')      ?: 'noreply@technologs.local';
$fromName = getenv('MAIL_FROM_NAME') ?: 'TechnoLogs';

// ── Send email ────────────────────────────────────────────────────────────────
$emailSent = sendResetEmail(
    $smtpHost, $smtpPort, $smtpUser, $smtpPass,
    $fromAddr, $fromName,
    $email, $resetLink
);

if (!$emailSent) {
    error_log("forgot_password: SMTP failed for $email — token still saved in DB");
}

respond_ok();

// ── Raw SMTP mailer (no Composer/library needed) ──────────────────────────────
function sendResetEmail(
    string $host, int $port,
    string $user, string $pass,
    string $fromAddr, string $fromName,
    string $toAddr, string $resetLink
): bool {
    $timeout = 10;
    $errno   = 0;
    $errstr  = '';

    // MailHog uses plain TCP on 1025; Gmail uses STARTTLS on 587
    $useAuth     = !empty($user) && !empty($pass);
    $useStartTls = ($port === 587);

    $socket = @fsockopen($host, $port, $errno, $errstr, $timeout);
    if (!$socket) {
        error_log("SMTP fsockopen failed ($host:$port): [$errno] $errstr");
        return false;
    }
    stream_set_timeout($socket, $timeout);

    // Helper: read one SMTP response (may be multi-line)
    $read = function() use ($socket): string {
        $out = '';
        while ($line = fgets($socket, 515)) {
            $out .= $line;
            if (isset($line[3]) && $line[3] === ' ') break;
        }
        return $out;
    };

    // Helper: send command and return response
    $cmd = function(string $line) use ($socket, $read): string {
        fwrite($socket, $line . "\r\n");
        return $read();
    };

    try {
        $read(); // consume 220 greeting

        $cmd('EHLO technologs');

        if ($useStartTls) {
            $cmd('STARTTLS');
            stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
            $cmd('EHLO technologs'); // re-greet after TLS upgrade
        }

        if ($useAuth) {
            $cmd('AUTH LOGIN');
            $cmd(base64_encode($user));
            $authResp = $cmd(base64_encode($pass));
            if (strpos($authResp, '235') === false) {
                error_log("SMTP AUTH failed: $authResp");
                fclose($socket);
                return false;
            }
        }

        $cmd("MAIL FROM:<$fromAddr>");
        $cmd("RCPT TO:<$toAddr>");
        $cmd('DATA');

        // ── Email content ─────────────────────────────────────────────────────
        $subject  = 'Reset Your TechnoLogs Password';
        $boundary = md5(uniqid('', true));
        $date     = date('r');

        $plainText =
            "You requested a password reset for your TechnoLogs account.\r\n\r\n" .
            "Click the link below to set a new password (expires in 1 hour):\r\n" .
            "$resetLink\r\n\r\n" .
            "If you did not request this, you can safely ignore this email.\r\n" .
            "Your password will NOT be changed.";

        $htmlBody = <<<HTML
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0a1628;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a1628;padding:40px 0;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0"
        style="background:rgba(255,255,255,0.04);border:1px solid rgba(26,188,156,0.25);
               border-radius:16px;overflow:hidden;">
        <tr>
          <td style="background:linear-gradient(135deg,#1abc9c,#16a085);padding:28px 36px;">
            <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700;letter-spacing:0.5px;">
              🔐 Reset Your Password
            </h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 36px;">
            <p style="margin:0 0 16px;color:rgba(255,255,255,0.75);font-size:15px;line-height:1.6;">
              We received a request to reset the password for your
              <strong style="color:#fff;">TechnoLogs</strong> account.
            </p>
            <p style="margin:0 0 28px;color:rgba(255,255,255,0.55);font-size:14px;line-height:1.6;">
              Click the button below. This link expires in
              <strong style="color:#1abc9c;">1 hour</strong>.
            </p>
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
              <tr>
                <td align="center"
                  style="background:linear-gradient(135deg,#1abc9c,#16a085);
                         border-radius:10px;padding:14px 32px;">
                  <a href="$resetLink"
                    style="color:#fff;font-size:15px;font-weight:600;text-decoration:none;">
                    Reset Password
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 6px;color:rgba(255,255,255,0.35);font-size:12px;">
              Or copy this link into your browser:
            </p>
            <p style="margin:0 0 28px;word-break:break-all;">
              <a href="$resetLink" style="color:#1abc9c;font-size:12px;">$resetLink</a>
            </p>
            <p style="margin:0;color:rgba(255,255,255,0.35);font-size:12px;line-height:1.6;">
              If you didn't request this, ignore this email — your password won't change.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 36px;border-top:1px solid rgba(255,255,255,0.06);">
            <p style="margin:0;color:rgba(255,255,255,0.25);font-size:11px;text-align:center;">
              © TechnoLogs · Automated message — do not reply.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
HTML;

        $headers  = "From: =?UTF-8?B?" . base64_encode($fromName) . "?= <$fromAddr>\r\n";
        $headers .= "To: $toAddr\r\n";
        $headers .= "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=\r\n";
        $headers .= "Date: $date\r\n";
        $headers .= "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: multipart/alternative; boundary=\"$boundary\"\r\n";
        $headers .= "X-Mailer: TechnoLogs/PHP\r\n";

        $body  = "--$boundary\r\n";
        $body .= "Content-Type: text/plain; charset=UTF-8\r\n\r\n";
        $body .= $plainText . "\r\n\r\n";
        $body .= "--$boundary\r\n";
        $body .= "Content-Type: text/html; charset=UTF-8\r\n\r\n";
        $body .= $htmlBody . "\r\n\r\n";
        $body .= "--$boundary--";

        $resp = $cmd($headers . "\r\n" . $body . "\r\n.");
        $cmd('QUIT');
        fclose($socket);

        return strpos($resp, '250') !== false;

    } catch (\Throwable $e) {
        error_log('SMTP error: ' . $e->getMessage());
        @fclose($socket);
        return false;
    }
}