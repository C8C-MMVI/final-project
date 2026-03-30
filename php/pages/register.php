<?php
session_start();
if (isset($_SESSION['user_id'])) {
    header('Location: /pages/login.php');
    exit;
}

require_once __DIR__ . '/../components/shared/background.php';
require_once __DIR__ . '/../components/register/register_left_panel.php';
require_once __DIR__ . '/../components/register/fields.php';
require_once __DIR__ . '/../components/register/submit_button.php';
require_once __DIR__ . '/../components/shared/toast.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>TechnoLogs – Create Account</title>
  <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="../assets/css/register.css"/>
</head>
<body>

<?php renderBackground('../images/bg.jpg'); ?>

<div class="page">
  <div class="container">

    <?php renderRegisterLeftPanel('../images/Logo.png'); ?>

    <div class="right">
      <div class="welcome">Create an Account</div>
      <div class="welcome-sub">Fill in your details to get started with TechnoLogs.</div>

      <form class="form" id="registerForm" novalidate autocomplete="off">

        <?php renderRegisterUsernameField(); ?>
        <?php renderRegisterPhoneField(); ?>
        <?php renderRegisterPasswordField(); ?>
        <?php renderRegisterConfirmPasswordField(); ?>
        <?php renderRegisterButton(); ?>

      </form>
    </div>

  </div>
</div>

<?php renderToast(); ?>

<script src="../assets/js/register.js"></script>
</body>
</html>