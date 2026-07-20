import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import DayPicker from "./DayPicker";
import { fmtINR, fmtRate } from "../utils/format";

const COLORS = ["#1D9E75", "#FAC775"];

export default function CalculatorTab({ loan, updateLoan, summary, loading }) {
  const chartData = summary
    ? [
        { name: "Principal", value: loan.principal },
        { name: "Interest", value: summary.originalTotalInterest },
      ]
    : [];

  return (
    <div className="space-y-4">
      {/* Loan inputs */}
      <div className="card">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">Loan details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="label">Loan amount (₹)</label>
            <input
              className="input"
              type="number"
              value={loan.principal}
              onChange={(e) => updateLoan("principal", Number(e.target.value))}
              min={0}
            />
          </div>
          <div>
            <label className="label">Initial interest rate (%)</label>
            <input
              className="input"
              type="number"
              value={loan.annualRate}
              step={0.05}
              onChange={(e) => updateLoan("annualRate", Number(e.target.value))}
              min={0}
              max={30}
            />
          </div>
          <div>
            <label className="label">Loan tenure (months)</label>
            <input
              className="input"
              type="number"
              value={loan.tenureMonths}
              onChange={(e) => updateLoan("tenureMonths", Number(e.target.value))}
              min={1}
              max={360}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">Loan start date</label>
            <input
              className="input"
              type="month"
              value={loan.startDate}
              onChange={(e) => updateLoan("startDate", e.target.value)}
            />
          </div>
          <div>
            <DayPicker
              value={loan.emiDay}
              onChange={(d) => updateLoan("emiDay", d)}
            />
          </div>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="metric-card">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Monthly EMI</p>
          <p className="text-lg font-medium text-brand-600 dark:text-brand-200">
            {loading ? "—" : summary ? fmtINR(summary.fixedEMI) : "—"}
          </p>
        </div>
        <div className="metric-card">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total interest</p>
          <p className="text-lg font-medium text-amber-600 dark:text-amber-100">
            {loading ? "—" : summary ? fmtINR(summary.originalTotalInterest) : "—"}
          </p>
        </div>
        <div className="metric-card">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total payment</p>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
            {loading ? "—" : summary ? fmtINR(summary.totalOutflow) : "—"}
          </p>
        </div>
        <div className="metric-card">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Effective tenure</p>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
            {loading ? "—" : summary ? `${summary.effectiveTenure} mo` : "—"}
          </p>
        </div>
      </div>

      {/* Pie chart */}
      {chartData.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">Principal vs interest</h3>
          <div className="flex gap-4 mb-2">
            {COLORS.map((c, i) => (
              <span key={i} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: c }} />
                {chartData[i]?.name}
              </span>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                dataKey="value"
                strokeWidth={0}
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => fmtINR(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
