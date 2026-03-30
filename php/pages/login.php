<?php
session_start();
if (isset($_SESSION['user_id'])) {
    $role = $_SESSION['role'] ?? 'customer';
    $redirect = match($role) {
        'admin'      => '/pages/admin_dashboard.php',
        'owner'      => '/pages/owner_dashboard.php',
        'technician' => '/pages/dashboard.php',
        default      => '/pages/customer_dashboard.php',
    };
    header('Location: ' . $redirect);
    exit;
}

require_once __DIR__ . '/../components/shared/background.php';
require_once __DIR__ . '/../components/shared/left_panel.php';
require_once __DIR__ . '/../components/login/fields.php';
require_once __DIR__ . '/../components/login/options.php';
require_once __DIR__ . '/../components/login/submit_button.php';
require_once __DIR__ . '/../components/login/footer.php';
require_once __DIR__ . '/../components/shared/toast.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>TechnoLogs – Management System</title>
  <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="../assets/css/login.css"/>
</head>
<body>

<?php renderBackground('../images/bg.jpg'); ?>

<div class="page">
  <div class="container">
    <?php renderLeftPanel('../images/Logo.png'); ?>
    <div class="right">
      <div class="welcome">Welcome Back</div>
      <div class="welcome-sub">Sign in to continue to your dashboard</div>
      <form class="form" id="loginForm" novalidate autocomplete="off">
        <?php renderLoginUsernameField(); ?>
        <?php renderLoginPasswordField(); ?>
        <?php renderOptions(); ?>
        <?php renderLoginButton(); ?>
        <?php renderLoginFooter(); ?>
      </form>
    </div>
  </div>
</div>

<?php renderToast(); ?>
<script src="../assets/js/login.js"></script>
</body>
</html>