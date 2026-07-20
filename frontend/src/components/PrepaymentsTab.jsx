import { useState } from "react";
import { fmtINR } from "../utils/format";

export default function PrepaymentsTab({
  prepayments,
  addPrepayment,
  removePrepayment,
  impact,
}) {
  const [form, setForm] = useState({ date: "", amount: "", note: "" });
  const [err, setErr] = useState("");

  const handleAdd = () => {
    const error = addPrepayment(form);
    if (error) { setErr(error); return; }
    setErr("");
    setForm({ date: "", amount: "", note: "" });
  };

  return (
    <div className="space-y-4">
      <div className="card">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Add prepayment</h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
          Prepayments reduce your outstanding balance — EMI stays the same and tenure shortens.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="label">Date of prepayment</label>
            <input
              className="input"
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Amount (₹)</label>
            <input
              className="input"
              type="number"
              placeholder="e.g. 200000"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              min={0}
            />
          </div>
          <div>
            <label className="label">Notes (optional)</label>
            <input
              className="input"
              type="text"
              placeholder="e.g. Annual bonus..."
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            />
          </div>
        </div>
        {err && <p className="text-xs text-red-500 dark:text-red-400 mt-2">{err}</p>}
        <div className="mt-3">
          <button className="btn-primary" onClick={handleAdd}>
            <span>+</span> Add prepayment
          </button>
        </div>
      </div>

      {/* History table */}
      <div className="card">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">Prepayment history</h3>
        {prepayments.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">No prepayments recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left py-2 text-xs text-gray-400 dark:text-gray-500 font-medium">Date</th>
                  <th className="text-left py-2 text-xs text-gray-400 dark:text-gray-500 font-medium">Amount</th>
                  <th className="text-left py-2 text-xs text-gray-400 dark:text-gray-500 font-medium">Notes</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {prepayments.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 dark:border-gray-800 last:border-0">
                    <td className="py-2 text-gray-600 dark:text-gray-300">{p.date}</td>
                    <td className="py-2 font-medium">{fmtINR(p.amount)}</td>
                    <td className="py-2 text-gray-400 dark:text-gray-500">{p.note || "—"}</td>
                    <td className="py-2 text-right">
                      <button className="btn-danger" onClick={() => removePrepayment(p.id)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Impact */}
      {impact && (
        <div className="card border-brand-100 dark:border-brand-400/30">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">Impact of prepayments</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="metric-card">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total prepaid</p>
              <p className="text-lg font-medium text-brand-600 dark:text-brand-200">{fmtINR(impact.totalPrepaid)}</p>
            </div>
            <div className="metric-card">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Interest saved</p>
              <p className="text-lg font-medium text-brand-600 dark:text-brand-200">{fmtINR(impact.interestSaved)}</p>
            </div>
            <div className="metric-card">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Months saved</p>
              <p className="text-lg font-medium text-brand-600 dark:text-brand-200">{impact.monthsSaved} months</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
