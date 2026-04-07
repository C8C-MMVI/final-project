import { useState, useEffect } from 'react';
import Panel  from '../components/shared/Panel';
import styles from './Dashboard.module.css';

export default function InventoryPage({ setPage, role }) {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    fetch('/api/inventory.php', {
      credentials: 'include',                         // ← FIXED
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) setItems(data.items ?? []);
        else setError(data.message);
      })
      .catch(() => setError('Cannot connect to server.'))
      .finally(() => setLoading(false));
  }, []);

  const getStockLevel = (qty) => {
    if (qty <= 2)  return { label: 'Critical', color: '#ef4444' };
    if (qty <= 5)  return { label: 'Low',      color: '#f97316' };
    if (qty <= 10) return { label: 'Fair',     color: '#facc15' };
    return             { label: 'Good',     color: '#4ade80' };
  };

  return (
    <main className={styles.content}>
      <Panel title="Inventory Summary" onLink={() => setPage('dashboard')} linkLabel="← Back to Dashboard">
        {loading ? (
          <div style={{ padding: '1.5rem' }}>Loading inventory…</div>
        ) : error ? (
          <div style={{ padding: '1.5rem', color: '#ef4444' }}>{error}</div>
        ) : items.length === 0 ? (
          <div style={{ padding: '1.5rem', color: 'var(--text-muted)' }}>No inventory items found.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Item Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Stock Level</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => {
                const stock = getStockLevel(item.quantity);
                return (
                  <tr key={item.item_id ?? i}>
                    <td className={styles.idCol}>{i + 1}</td>
                    <td className={styles.bold}>{item.item_name}</td>
                    <td>{item.category ?? '—'}</td>
                    <td>{item.quantity}</td>
                    <td>{item.price ? `₱${Number(item.price).toLocaleString()}` : '—'}</td>
                    <td>
                      <span style={{
                        color: stock.color,
                        fontWeight: 600,
                        fontSize: '12px',
                      }}>
                        ● {stock.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Panel>
    </main>
  );
}