<?php
function renderLoginUsernameField(): void {
?>
<div class="field">
  <label for="username">Username</label>
  <div class="input-wrap">
    <input type="text" id="username" name="username"
           placeholder="Enter your username…" autocomplete="off"/>
  </div>
  <span class="field-error" id="err-username">⚠ Username is required.</span>
</div>
<?php
}

function renderLoginPasswordField(): void {
?>
<div class="field">
  <label for="password">Password</label>
  <div class="input-wrap">
    <input type="password" id="password" name="password"
           placeholder="Enter your password…" autocomplete="off"/>
    <button type="button" class="toggle-pw" id="togglePw" aria-label="Toggle password visibility">
      <svg id="eyeIcon" width="18" height="18" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
      <svg id="eyeOffIcon" width="18" height="18" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
           style="display:none">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </svg>
    </button>
  </div>
  <span class="field-error" id="err-password">⚠ Password is required.</span>
</div>
<?php
}