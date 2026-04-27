// src/components/shared/ReviewModal.jsx
import { useState } from 'react';
import styles from './ReviewModal.module.css';

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className={styles.starPicker}>
      {[1, 2, 3, 4, 5].map(n => (
        <svg
          key={n}
          className={`${styles.star} ${n <= (hovered || value) ? styles.starFilled : ''}`}
          viewBox="0 0 24 24"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      <span className={styles.ratingLabel}>
        {value ? ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][value] : 'Select rating'}
      </span>
    </div>
  );
}

export default function ReviewModal({ repair, onClose, onSubmitted }) {
  const [rating,    setRating]    = useState(0);
  const [comment,   setComment]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error,     setError]     = useState(null);

  const handleSubmit = async () => {
    if (rating === 0) { setError('Please select a star rating.'); return; }

    setSubmitting(true);
    setError(null);
    try {
      const res  = await fetch('/api/reviews.php', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: repair.request_id,
          rating,
          comment,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onSubmitted?.();
        onClose();
      } else {
        setError(data.message);
      }
    } catch {
      setError('Cannot connect to server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        <div className={styles.header}>
          <div className={styles.title}>Leave a Review</div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>
          <div className={styles.repairInfo}>
            <span className={styles.repairLabel}>Repair #{repair.request_id}</span>
            <span className={styles.repairDevice}>{repair.device_type}</span>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Your Rating</label>
            <StarPicker value={rating} onChange={setRating} />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Comment <span className={styles.optional}>(optional)</span></label>
            <textarea
              className={styles.textarea}
              rows={4}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Share your experience with this repair…"
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button className={styles.submitBtn} onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit Review'}
          </button>
        </div>

      </div>
    </div>
  );
}