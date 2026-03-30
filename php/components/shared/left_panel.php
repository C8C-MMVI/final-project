<?php
function renderLeftPanel(string $logoImage): void {
?>
<div class="left">
  <img src="<?= htmlspecialchars($logoImage) ?>" alt="TechnoLogs" class="logo"/>
  <div class="brand">TechnoLogs</div>
  <div class="brand-sub">Management System</div>
</div>
<?php
}