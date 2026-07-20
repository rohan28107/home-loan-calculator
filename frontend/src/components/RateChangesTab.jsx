import { useState } from "react";
import { fmtYearMonth } from "../utils/format";

export default function RateChangesTab({ loan, rateChanges, addRateChange, removeRateChange }) {
  const [form, setForm] = useState({ effectiveFrom: "", rate: "", note: "" });
  const [err, setErr] = useState("");

  const handleAdd = () => {
    const error = addRateChange(form);
    if (error) { setErr(error); return; }
    setErr("");
    setForm({ effectiveFrom: "", rate: "", note: "" });
  };

  return (
    <div className="space-y-4">
      <div className="card">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Add rate change</h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
          When your bank revises your floating rate, enter it here. EMI stays fixed — tenure adjusts automatically.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="label">Effective from (month)</label>
            <input
              className="input"
              type="month"
              value={form.effectiveFrom}
              onChange={(e) => setForm((f) => ({ ...f, effectiveFrom: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">New interest rate (%)</label>
            <input
              className="input"
              type="number"
              step={0.05}
              placeholder="e.g. 7.45"
              value={form.rate}
              onChange={(e) => setForm((f) => ({ ...f, rate: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Notes (optional)</label>
            <input
              className="input"
              type="text"
              placeholder="e.g. RBI rate cut Jan 2026"
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            />
          </div>
        </div>
        {err && <p className="text-xs text-red-500 dark:text-red-400 mt-2">{err}</p>}
        <div className="mt-3">
          <button className="btn-primary" onClick={handleAdd}>
            <span>+</span> Add rate change
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-brand-50 border border-brand-100 rounded-xl px-4 py-3 text-xs text-brand-800
                      dark:bg-brand-400/10 dark:border-brand-400/20 dark:text-brand-200">
        When interest rate changes, your <strong>EMI stays the same</strong> — only the loan tenure adjusts.
      </div>

      <div className="card">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">Rate history</h3>
        {rateChanges.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">No rate changes recorded yet.</p>
        ) : (
          <div className="space-y-0">
            {/* Initial rate row */}
            <div className="flex items-center gap-3 py-2.5 border-b border-gray-100 dark:border-gray-700">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-400 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-sm font-medium">{loan.annualRate.toFixed(2)}%</span>
                <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
                  Initial rate · {fmtYearMonth(loan.startDate) || "loan start"}
                </span>
              </div>
            </div>

            {rateChanges.map((rc, idx) => {
              const prev = rateChanges[idx - 1]?.rate ?? loan.annualRate;
              const isDown = rc.rate < prev;
              return (
                <div
                  key={rc.id}
                  className="flex items-center gap-3 py-2.5 border-b border-gray-100 dark:border-gray-700 last:border-0"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-sm font-medium">{rc.rate.toFixed(2)}%</span>
                    <span
                      className={`text-xs ml-2 font-medium ${isDown ? "text-brand-600 dark:text-brand-200" : "text-red-500 dark:text-red-400"}`}
                    >
                      {isDown ? "↓ down" : "↑ up"}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
                      from {fmtYearMonth(rc.effectiveFrom)}
                      {rc.note && ` · ${rc.note}`}
                    </span>
                  </div>
                  <button className="btn-danger" onClick={() => removeRateChange(rc.id)}>
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
