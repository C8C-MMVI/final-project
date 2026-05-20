/**
 * SearchDropdown.jsx
 * Fixed version:
 *  - Added 'shops' to CATEGORY_META so shop results actually render
 *  - handleSelect now passes (page, page_id) to onNavigate for deep-linking
 *  - Added console.error logging so API failures surface in DevTools
 *  - AbortController cleanup on unmount
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './Topbar.module.css';

// ── Category meta ─────────────────────────────────────────────────────────
// FIX 1: Added 'shops' — was missing, so shop results were silently dropped
const CATEGORY_META = {
  repairs:      { label: 'Repairs',      icon: '🔧' },
  customers:    { label: 'Customers',    icon: '👤' },
  transactions: { label: 'Transactions', icon: '💳' },
  technicians:  { label: 'Technicians',  icon: '🛠️'  },
  users:        { label: 'Users',        icon: '👥' },
  shops:        { label: 'Shops',        icon: '🏪' }, // ← was missing
};



// ── Icons ─────────────────────────────────────────────────────────────────
const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconSpinner = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" width="16" height="16"
       style={{ animation: 'tb-spin 0.7s linear infinite' }}>
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83
             M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
  </svg>
);

// ── Debounce hook ─────────────────────────────────────────────────────────
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ═════════════════════════════════════════════════════════════════════════
// SearchDropdown component
// ═════════════════════════════════════════════════════════════════════════
export default function SearchDropdown({ onNavigate, onClose }) {
  const [query,   setQuery]   = useState('');
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [cursor,  setCursor]  = useState(-1);

  const inputRef = useRef(null);
  const listRef  = useRef(null);
  const abortRef = useRef(null);

  const debouncedQuery = useDebounce(query, 300);

  // Auto-focus on open
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, []);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  // ── Fetch from API ───────────────────────────────────────────────────
  useEffect(() => {
    const q = debouncedQuery.trim();

    if (q.length < 2) {
      setApiData(null);
      setLoading(false);
      setError('');
      return;
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError('');
    setCursor(-1);

    fetch(`/api/search.php?q=${encodeURIComponent(q)}`, {
      credentials: 'include',
      signal: abortRef.current.signal,
    })
      .then(r => {
        // FIX 2: surface HTTP errors (401 Unauthorized, 403 Forbidden, 500, etc.)
        if (!r.ok) {
          throw new Error(`HTTP ${r.status}: ${r.statusText}`);
        }
        return r.json();
      })
      .then(data => {
        if (data.success) {
          setApiData(data.results);
        } else {
          console.error('[Search] API returned success:false', data);
          setError('Search failed. Please try again.');
        }
      })
      .catch(err => {
        if (err.name === 'AbortError') return;
        console.error('[Search] Fetch error:', err.message);
        setError('Could not reach the server.');
      })
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  // ── Flat item list for keyboard nav ─────────────────────────────────
  const allItems = useCallback(() => {
    const items = [];
    if (apiData) {
      Object.entries(apiData).forEach(([cat, rows]) => {
        rows.forEach(r => items.push({ type: 'result', cat, ...r }));
      });
    }
    return items;
  }, [apiData]);

  // ── FIX 3: Navigate passes BOTH page and page_id ────────────────────
  // Your DashboardLayout's onNavigate should accept (page, id) so it can
  // scroll to / highlight the specific record. Example:
  //   onNavigate('repairs', 42)  → open repairs page, highlight repair #42
  //   onNavigate('dashboard')    → just go to dashboard
  const handleSelect = (page, pageId) => {
    onNavigate?.(page, pageId ?? null);
    onClose();
  };

  // ── Keyboard navigation ──────────────────────────────────────────────
  const handleKeyDown = (e) => {
    const items = allItems();
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor(c => Math.min(c + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor(c => Math.max(c - 1, 0));
    } else if (e.key === 'Enter' && cursor >= 0) {
      e.preventDefault();
      const item = items[cursor];
      if (item) handleSelect(item.page, item.page_id);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (cursor >= 0 && listRef.current) {
      const active = listRef.current.querySelector(`[data-idx="${cursor}"]`);
      active?.scrollIntoView({ block: 'nearest' });
    }
  }, [cursor]);

  // ── Render ───────────────────────────────────────────────────────────
  const hasResults = apiData && !Array.isArray(apiData) && Object.values(apiData).some(arr => arr.length > 0);
  const q = query.trim();

  let idx = 0;

  return (
    <>
      <style>{`@keyframes tb-spin { to { transform: rotate(360deg); } }`}</style>

      <div className={`${styles.dropdown} ${styles.searchDropdown}`}>

        {/* ── Input ── */}
        <div className={styles.searchInputWrap}>
          <span className={styles.searchIcon}>
            {loading ? <IconSpinner /> : <IconSearch />}
          </span>
          <input
            ref={inputRef}
            type="text"
            className={styles.searchInput}
            placeholder="Search repairs, customers, transactions…"
            value={query}
            onChange={e => { setQuery(e.target.value); setCursor(-1); }}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
          {query && (
            <button
              className={styles.searchClear}
              onClick={() => { setQuery(''); setApiData(null); inputRef.current?.focus(); }}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* ── Results ── */}
        <div className={styles.searchResults} ref={listRef}>

          {/* Error state */}
          {error && (
            <div className={styles.noResults} style={{ color: '#e74c3c' }}>{error}</div>
          )}

          {/* DB results grouped by category */}
          {!error && hasResults && Object.entries(apiData).map(([cat, rows]) => {
            if (!rows.length) return null;
            const meta = CATEGORY_META[cat] ?? { label: cat, icon: '📄' };
            return (
              <div key={cat}>
                <div className={styles.dropdownLabel}>
                  <span style={{ marginRight: 5 }}>{meta.icon}</span>{meta.label}
                </div>
                {rows.map(r => {
                  const myIdx = idx++;
                  return (
                    <button
                      key={`${cat}-${r.id}`}
                      data-idx={myIdx}
                      className={`${styles.searchItem} ${cursor === myIdx ? styles.searchItemActive : ''}`}
                      onClick={() => handleSelect(r.page, r.page_id)}
                      onMouseEnter={() => setCursor(myIdx)}
                    >
                      <div className={styles.searchItemMain}>{r.label}</div>
                      {r.sub && (
                        <div className={styles.searchItemSub}>{r.sub}</div>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}

          {/* No results */}
          {!error && !loading && q.length >= 2 && apiData && !hasResults && (
            <div className={styles.noResults}>No results for "{q}"</div>
          )}

          {/* Hint */}
          {!q && (
            <div className={styles.searchHint}>
              Type at least 2 characters to search…
            </div>
          )}

        </div>
      </div>
    </>
  );
}