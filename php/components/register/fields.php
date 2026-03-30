<?php
function renderRegisterUsernameField(): void {
?>
<div class="field">
  <label class="field__label" for="username">Username</label>
  <div class="input-wrap">
    <input type="text" id="username" name="username"
           placeholder="Choose a username…" autocomplete="off"/>
  </div>
  <span class="field-error" id="err-username"></span>
</div>
<?php
}

function renderRegisterPhoneField(): void {
?>
<div class="field">
  <label class="field__label" for="phone">Phone Number</label>
  <div class="input-wrap">
    <input type="tel" id="phone" name="phone"
           placeholder="e.g. +63 912 345 6789…" autocomplete="off"/>
  </div>
  <span class="field-error" id="err-phone"></span>
</div>
<?php
}

function renderRegisterPasswordField(): void {
?>
<div class="field">
  <label class="field__label" for="password">Password</label>
  <div class="input-wrap">
    <input type="password" id="password" name="password"
           placeholder="Create a password…" autocomplete="new-password"/>
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
  <div class="strength-wrap" id="strengthWrap">
    <div class="strength-bar"><div class="strength-fill" id="strengthFill"></div></div>
    <div class="strength-label" id="strengthLabel"></div>
  </div>
  <span class="field-error" id="err-password"></span>
</div>
<?php
}

function renderRegisterConfirmPasswordField(): void {
?>
<div class="field">
  <label class="field__label" for="confirm_password">Confirm Password</label>
  <div class="input-wrap">
    <input type="password" id="confirm_password" name="confirm_password"
           placeholder="Repeat your password…" autocomplete="new-password"/>
    <button type="button" class="toggle-pw" id="toggleConfirmPw" aria-label="Toggle password visibility">
      <svg id="eyeIcon2" width="18" height="18" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
      <svg id="eyeOffIcon2" width="18" height="18" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
           style="display:none">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </svg>
    </button>
  </div>
  <span class="field-error" id="err-confirm"></span>
</div>
<?php
}