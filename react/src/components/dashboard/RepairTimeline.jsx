import { useEffect, useState, useRef } from "react";

// ─── Status ordering ────────────────────────────────────────────────────────
// Maps every possible MongoDB "status" string → canonical display label + step index.
// Add more entries here if your statuses expand.
const STATUS_META = {
  // Spring Boot / PHP formats
  "Pending":        { label: "Pending",     step: 0 },
  "In Progress":    { label: "In Progress", step: 1 },
  "Waiting Parts":  { label: "Waiting Parts", step: 2 },
  "Completed":      { label: "Completed",   step: 3 },
  "Cancelled":      { label: "Cancelled",   step: 4 },
  // Django lowercase formats (just in case)
  "pending":        { label: "Pending",     step: 0 },
  "accepted":       { label: "Pending",     step: 0 },
  "in_progress":    { label: "In Progress", step: 1 },
  "waiting_parts":  { label: "Waiting Parts", step: 2 },
  "completed":      { label: "Completed",   step: 3 },
  "cancelled":      { label: "Cancelled",   step: 4 },
  "rejected":       { label: "Cancelled",   step: 4 },
};

const STEP_ORDER = ["Pending", "In Progress", "Waiting Parts", "Completed"];

const STATUS_COLORS = {
  "Pending":       { color: "rgba(255,255,255,0.5)",  bg: "rgba(255,255,255,0.07)" },
  "In Progress":   { color: "#f1c40f",                bg: "rgba(241,196,15,0.10)"  },
  "Waiting Parts": { color: "#e67e22",                bg: "rgba(230,126,34,0.10)"  },
  "Completed":     { color: "#1abc9c",                bg: "rgba(26,188,156,0.10)"  },
  "Cancelled":     { color: "#e74c3c",                bg: "rgba(231,76,60,0.10)"   },
};

// ─── Adapter ─────────────────────────────────────────────────────────────────
// Converts raw MongoDB event array → stepper-ready array.
//
// Input (from Spring Boot /api/events/timeline/{id}):
//   [{ eventId, requestId, status, changedBy, changedByUsername, note, createdAt }]
//
// Output:
//   [{ label, done, active, timestamp, note, changedByUsername }]
function buildStepperFromEvents(events = []) {
  if (!events.length) return STEP_ORDER.map((label) => ({ label, done: false, active: false }));

  // Find the latest status (first in array — endpoint returns newest first)
  const latestRaw   = events[0]?.status ?? "Pending";
  const latestMeta  = STATUS_META[latestRaw] ?? { label: latestRaw, step: 0 };
  const currentStep = latestMeta.step;
  const currentLabel = latestMeta.label;

  // Build a lookup: label → most recent event for that label
  const eventByLabel = {};
  [...events].reverse().forEach((ev) => {
    const meta = STATUS_META[ev.status];
    if (meta) eventByLabel[meta.label] = ev;
  });

  // Handle Cancelled separately (not in the linear flow)
  if (currentLabel === "Cancelled") {
    return [
      ...STEP_ORDER.map((label) => ({ label, done: false, active: false })),
      {
        label: "Cancelled",
        done: true,
        active: true,
        timestamp: events[0]?.createdAt,
        note: events[0]?.note,
        changedByUsername: events[0]?.changedByUsername,
      },
    ];
  }

  return STEP_ORDER.map((label, idx) => {
    const ev = eventByLabel[label];
    return {
      label,
      done:   idx < currentStep,
      active: idx === currentStep,
      timestamp:         ev?.createdAt         ?? null,
      note:              ev?.note              ?? null,
      changedByUsername: ev?.changedByUsername ?? null,
    };
  });
}

// ─── Hook — fetches MongoDB timeline ─────────────────────────────────────────
function useRepairTimeline(requestId) {
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!requestId) return;
    setLoading(true);
    setError(null);

    fetch(`/api/events/timeline/${requestId}`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setEvents(data.events ?? []);
        else setError(data.message ?? "Failed to load timeline");
      })
      .catch(() => setError("Could not reach timeline service"))
      .finally(() => setLoading(false));
  }, [requestId]);

  return { events, loading, error };
}

// ─── Timestamp formatter ──────────────────────────────────────────────────────
function fmt(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString("en-PH", {
      month: "short", day: "numeric",
      hour: "numeric", minute: "2-digit",
    });
  } catch { return null; }
}

// ─── Animated connector line ──────────────────────────────────────────────────
function Connector({ done }) {
  return (
    <div className="flex justify-center w-8 flex-shrink-0 my-[2px]">
      <div
        className="w-[2px] h-5 rounded-full transition-all duration-500"
        style={{
          background: done
            ? "linear-gradient(180deg, #1abc9c, #0ea882)"
            : "rgba(255,255,255,0.08)",
        }}
      />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function RepairTimeline({ currentRepair }) {
  const requestId = currentRepair?.request_id ?? currentRepair?.id ?? null;
  const { events, loading, error } = useRepairTimeline(requestId);

  const steps   = buildStepperFromEvents(events);
  const hasMongo = events.length > 0;

  // Latest note from MongoDB events (for the notes panel)
  const latestNote = events.find((e) => e.note)?.note ?? currentRepair?.technician_notes ?? null;
  const latestNoteBy = events.find((e) => e.note)?.changedByUsername ?? null;

  // Animate steps in on mount
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      ref={ref}
      className="flex flex-col gap-4 p-6 rounded-[16px]"
      style={{
        background:     "rgba(10,22,44,0.6)",
        border:         "1px solid rgba(26,188,156,0.12)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-koho font-bold text-white text-[1rem] tracking-wide">
          Latest Repair Status
        </h3>
        {hasMongo && (
          <span
            className="flex items-center gap-1 px-2 py-[3px] rounded-full text-[0.65rem] font-koho font-semibold tracking-wider uppercase"
            style={{ background: "rgba(26,188,156,0.10)", color: "#1abc9c" }}
          >
            <span
              className="w-[6px] h-[6px] rounded-full animate-pulse"
              style={{ background: "#1abc9c" }}
            />
            Live
          </span>
        )}
      </div>

      {/* Device info */}
      {currentRepair ? (
        <div className="flex flex-col gap-1 pb-4 border-b border-[rgba(26,188,156,0.1)]">
          <p className="font-koho text-white font-semibold text-[0.95rem]">
            {currentRepair.device_type}
          </p>
          <p className="font-koho text-[rgba(255,255,255,0.5)] text-[0.82rem]">
            {currentRepair.issue_description}
          </p>
        </div>
      ) : (
        <p className="font-koho text-[rgba(255,255,255,0.4)] text-[0.85rem]">
          No active repair requests.
        </p>
      )}

      {/* Loading / error states */}
      {loading && (
        <div className="flex items-center gap-2 py-2">
          <div
            className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "rgba(26,188,156,0.4)", borderTopColor: "transparent" }}
          />
          <p className="font-koho text-[rgba(255,255,255,0.35)] text-[0.8rem]">
            Loading timeline…
          </p>
        </div>
      )}
      {error && !loading && (
        <p className="font-koho text-[rgba(231,76,60,0.7)] text-[0.8rem]">
          ⚠ {error}
        </p>
      )}

      {/* Stepper — built from MongoDB events */}
      {!loading && steps.length > 0 && (
        <div className="flex flex-col mt-2">
          {steps.map(({ label, done, active, timestamp, changedByUsername }, i) => {
            const colors = STATUS_COLORS[label] ?? STATUS_COLORS["Pending"];
            const isLast = i === steps.length - 1;

            return (
              <div
                key={label}
                className="flex flex-col"
                style={{
                  opacity:   visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(6px)",
                  transition: `opacity 0.35s ease ${i * 70}ms, transform 0.35s ease ${i * 70}ms`,
                }}
              >
                <div className="flex items-center gap-3">
                  {/* Circle */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[0.75rem] font-bold flex-shrink-0"
                    style={{
                      background: done
                        ? "linear-gradient(135deg, #0ea882, #1abc9c)"
                        : active
                        ? "rgba(26,188,156,0.15)"
                        : "rgba(255,255,255,0.07)",
                      border: active
                        ? "2px solid #1abc9c"
                        : done
                        ? "none"
                        : "2px solid rgba(255,255,255,0.15)",
                      boxShadow: active ? "0 0 14px rgba(26,188,156,0.45)" : "none",
                      color: done ? "white" : "rgba(255,255,255,0.4)",
                      transition: "all 0.4s ease",
                    }}
                  >
                    {done ? "✓" : i + 1}
                  </div>

                  {/* Label + badge */}
                  <div className="flex flex-col gap-[2px] flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="font-koho text-[0.85rem] font-medium"
                        style={{ color: done || active ? colors.color : "rgba(255,255,255,0.3)" }}
                      >
                        {label}
                      </span>
                      {active && (
                        <span
                          className="px-2 py-[2px] rounded-full text-[0.68rem] font-koho font-semibold"
                          style={{ background: colors.bg, color: colors.color }}
                        >
                          Current
                        </span>
                      )}
                    </div>

                    {/* Timestamp + who changed it — from MongoDB */}
                    {(done || active) && timestamp && (
                      <p className="font-koho text-[0.68rem] text-[rgba(255,255,255,0.3)] truncate">
                        {fmt(timestamp)}
                        {changedByUsername && (
                          <span className="text-[rgba(26,188,156,0.6)]">
                            {" "}· {changedByUsername}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>

                {/* Connector line between steps */}
                {!isLast && <Connector done={done} />}
              </div>
            );
          })}
        </div>
      )}

      {/* Notes panel — prefers MongoDB note, falls back to repair field */}
      {latestNote && (
        <div
          className="mt-2 p-3 rounded-[10px] border-l-4"
          style={{ background: "rgba(26,188,156,0.06)", borderColor: "#1abc9c" }}
        >
          <div className="flex items-center justify-between mb-1">
            <p className="font-koho text-[0.7rem] text-teal tracking-widest uppercase">
              Technician Notes
            </p>
            {latestNoteBy && (
              <p className="font-koho text-[0.65rem] text-[rgba(26,188,156,0.5)]">
                — {latestNoteBy}
              </p>
            )}
          </div>
          <p className="font-koho text-[rgba(255,255,255,0.65)] text-[0.83rem] leading-relaxed">
            {latestNote}
          </p>
        </div>
      )}
    </div>
  );
}