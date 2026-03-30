<?php
function renderBackground(string $bgImage): void {
?>
<div class="bg" style="background-image: url('<?= htmlspecialchars($bgImage) ?>')"></div>
<?php
}