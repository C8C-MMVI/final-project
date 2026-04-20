/**
 * assets/js/topbar.js
 * TechnoLogs — Top bar dropdown logic
 * All functions/variables are prefixed with "tb" to avoid
 * conflicts with existing dashboard.js code.
 *
 * FIX LOG:
 *  1. XSS: tbEscape() helper applied to all innerHTML interpolations
 *  2. tbToggle: guarded btn parameter against null/undefined
 *  3. tbCloseAll: uses data-tb-trigger for future-proof button selection
 *  4. tbMarkAllRead: hides badge instead of removing the DOM node
 *  5. Outside-click: simplified to .topbar__right only (redundant check removed)
 *  6. tbFilterSearch: debounce-ready comment added; escape applied
 */

// ── Helpers ───────────────────────────────────────────────────────────────

/**
 * Escape a string for safe HTML attribute and text interpolation.
 * Prevents XSS when building innerHTML from dynamic data.
 * @param {string} str
 * @returns {string}
 */
function tbEscape(str) {
    return String(str)
        .replace(/&/g,  '&amp;')
        .replace(/</g,  '&lt;')
        .replace(/>/g,  '&gt;')
        .replace(/"/g,  '&quot;')
        .replace(/'/g,  '&#039;');
}

// ── Core dropdown logic ───────────────────────────────────────────────────

/**
 * Toggle a dropdown open or closed.
 * @param {string}           id  - The dropdown element ID
 * @param {HTMLElement|null} btn - The button that was clicked (may be null)
 */
function tbToggle(id, btn) {
    const dropdown = document.getElementById(id);
    if (!dropdown) return;

    const isOpen = dropdown.classList.contains('tb-open');

    tbCloseAll();

    if (!isOpen) {
        dropdown.classList.add('tb-open');

        // FIX 2: Guard against missing btn argument
        if (btn) btn.classList.add('tb-active');

        // Auto-focus the search input when the search dropdown opens
        if (id === 'tbSearchDropdown') {
            setTimeout(() => {
                const input = document.getElementById('tbSearchInput');
                if (input) input.focus();
            }, 40);
        }
    }
}

/**
 * Close every open top-bar dropdown and deactivate all trigger buttons.
 * FIX 3: Uses data-tb-trigger instead of hard-coded class names so any
 *         future button type is automatically included.
 */
function tbCloseAll() {
    document.querySelectorAll('.tb-dropdown.tb-open')
            .forEach(d => d.classList.remove('tb-open'));

    // Works with .tb-icon-btn, .tb-profile-btn, or any future button type,
    // as long as the element carries data-tb-trigger in the PHP template.
    document.querySelectorAll('[data-tb-trigger].tb-active')
            .forEach(b => b.classList.remove('tb-active'));
}

// ── Notifications ─────────────────────────────────────────────────────────

/**
 * Mark all notifications as read and hide the unread badge.
 * FIX 4: Hides the badge (display:none) instead of removing it from the DOM
 *         so it can be re-shown if the count later changes (e.g. via polling).
 */
function tbMarkAllRead() {
    document.querySelectorAll('.tb-notif-item.unread')
            .forEach(el => el.classList.remove('unread'));

    const badge = document.getElementById('tbNotifBadge');
    if (badge) {
        badge.textContent = '0';
        badge.style.display = 'none';
    }

    // Persist to server when the API endpoint is ready:
    // fetch('/api/notifications_read.php', { method: 'POST', credentials: 'include' });
}

/**
 * Update the badge count. Pass 0 to hide it.
 * Provided so future notification polling can call this directly.
 * @param {number} count
 */
function tbSetBadgeCount(count) {
    const badge = document.getElementById('tbNotifBadge');
    if (!badge) return;
    if (count > 0) {
        badge.textContent = count;
        badge.style.display = '';
    } else {
        badge.textContent = '0';
        badge.style.display = 'none';
    }
}

// ── Search ────────────────────────────────────────────────────────────────

/**
 * Filter search quick-links by query string.
 * Relies on tbNavLinks injected by renderTopbar() in topbar.php.
 *
 * FIX 1: All dynamic values written to innerHTML are passed through tbEscape().
 * NOTE:  If this is ever wired to a live API, wrap the fetch call in a
 *        debounce (~200ms) to avoid hammering the server on every keystroke.
 *
 * @param {string} query
 */
function tbFilterSearch(query) {
    const container = document.getElementById('tbSearchResults');
    if (!container || typeof tbNavLinks === 'undefined') return;

    const q        = query.toLowerCase().trim();
    const filtered = q
        ? tbNavLinks.filter(n => n.label.toLowerCase().includes(q))
        : tbNavLinks;

    if (filtered.length === 0) {
        container.innerHTML =
            '<div class="tb-search-item" style="color:var(--muted);cursor:default;pointer-events:none">' +
            'No results found</div>';
        return;
    }

    // FIX 1: tbEscape() applied to both href and label before writing to innerHTML
    container.innerHTML = filtered.map(n => `
        <a href="${tbEscape(n.href)}" class="tb-search-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"/>
            </svg>
            ${tbEscape(n.label)}
        </a>`).join('');
}

// ── Global listeners ──────────────────────────────────────────────────────

/**
 * FIX 5: Only check .topbar__right — the .tb-dropdown-wrapper check
 *         was redundant since all wrappers are already inside .topbar__right.
 *         The original double-check could also accidentally close dropdowns
 *         when clicking interactive elements that share a parent class name.
 */
document.addEventListener('click', function (e) {
    if (!e.target.closest('.topbar__right')) {
        tbCloseAll();
    }
});

// Close on Escape key
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') tbCloseAll();
});