/**
 * assets/js/topbar.js
 * TechnoLogs — Top bar dropdown logic
 * All functions/variables are prefixed with "tb" to avoid
 * conflicts with existing dashboard.js code.
 */

/**
 * Toggle a dropdown open or closed.
 * @param {string}      id  - The dropdown element ID
 * @param {HTMLElement} btn - The button that was clicked
 */
function tbToggle(id, btn) {
    const dropdown = document.getElementById(id);
    const isOpen   = dropdown.classList.contains('tb-open');

    tbCloseAll();

    if (!isOpen) {
        dropdown.classList.add('tb-open');
        btn.classList.add('tb-active');

        // Auto-focus the search input when opened
        if (id === 'tbSearchDropdown') {
            setTimeout(() => {
                const input = document.getElementById('tbSearchInput');
                if (input) input.focus();
            }, 40);
        }
    }
}

/** Close every open top-bar dropdown. */
function tbCloseAll() {
    document.querySelectorAll('.tb-dropdown.tb-open')
            .forEach(d => d.classList.remove('tb-open'));
    document.querySelectorAll('.tb-icon-btn.tb-active, .tb-profile-btn.tb-active')
            .forEach(b => b.classList.remove('tb-active'));
}

/** Mark all notifications as read and remove the badge. */
function tbMarkAllRead() {
    document.querySelectorAll('.tb-notif-item.unread')
            .forEach(el => el.classList.remove('unread'));

    const badge = document.getElementById('tbNotifBadge');
    if (badge) badge.remove();
}

/**
 * Filter search quick-links by query string.
 * Relies on tbNavLinks injected by renderTopbar() in topbar.php.
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
            '<div class="tb-search-item" style="color:#64748b;cursor:default;pointer-events:none">' +
            'No results found</div>';
        return;
    }

    container.innerHTML = filtered.map(n => `
        <a href="${n.href}" class="tb-search-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"/>
            </svg>
            ${n.label}
        </a>`).join('');
}

// ── Global listeners ──────────────────────────────────────

// Close when clicking outside any dropdown wrapper
document.addEventListener('click', function (e) {
    if (!e.target.closest('.tb-dropdown-wrapper') && !e.target.closest('.topbar__right')) {
        tbCloseAll();
    }
});

// Close on Escape key
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') tbCloseAll();
});