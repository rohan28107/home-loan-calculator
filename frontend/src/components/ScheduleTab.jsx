import { useState } from "react";
import { fmtINR, fmtRate } from "../utils/format";

export default function ScheduleTab({ schedule, loading }) {
  const [view, setView] = useState("all");

  const yearlyData = (() => {
    const years = {};
    schedule.forEach((row) => {
      const yr = Math.ceil(row.month / 12);
      if (!years[yr])
        years[yr] = { year: yr, emi: 0, principal: 0, interest: 0, prepay: 0, balance: 0, rate: row.rate };
      if (row.type === "prepayment") {
        years[yr].prepay += row.principal;
      } else {
        years[yr].emi += row.emi;
        years[yr].principal += row.principal;
        years[yr].interest += row.interest;
        years[yr].rate = row.rate;
      }
      years[yr].balance = row.balance;
    });
    return Object.values(years);
  })();

  const rows = view === "yearly" ? yearlyData : schedule;

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">Amortisation schedule</h3>
        <select
          className="input w-auto text-xs py-1.5 px-2"
          value={view}
          onChange={(e) => setView(e.target.value)}
        >
          <option value="all">All months</option>
          <option value="yearly">Yearly summary</option>
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">Calculating...</p>
      ) : (
        <div className="overflow-auto max-h-[520px]">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left py-2 px-2 text-gray-400 dark:text-gray-500 font-medium">#</th>
                <th className="text-left py-2 px-2 text-gray-400 dark:text-gray-500 font-medium">
                  {view === "yearly" ? "Year" : "Date"}
                </th>
                <th className="text-left py-2 px-2 text-gray-400 dark:text-gray-500 font-medium">Rate</th>
                <th className="text-right py-2 px-2 text-gray-400 dark:text-gray-500 font-medium">EMI</th>
                <th className="text-right py-2 px-2 text-gray-400 dark:text-gray-500 font-medium">Principal</th>
                <th className="text-right py-2 px-2 text-gray-400 dark:text-gray-500 font-medium">Interest</th>
                <th className="text-right py-2 px-2 text-gray-400 dark:text-gray-500 font-medium">Balance</th>
                <th className="text-left py-2 px-2 text-gray-400 dark:text-gray-500 font-medium">Type</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const isPrepay = row.type === "prepayment";
                return (
                  <tr
                    key={i}
                    className={`border-b border-gray-50 dark:border-gray-800 last:border-0 ${
                      isPrepay ? "bg-brand-50 dark:bg-brand-400/10" : "hover:bg-gray-50 dark:hover:bg-gray-700/40"
                    }`}
                  >
                    <td className="py-2 px-2 text-gray-400 dark:text-gray-500">
                      {view === "yearly"
                        ? row.year
                        : isPrepay
                        ? "↳"
                        : row.month}
                    </td>
                    <td className="py-2 px-2 text-gray-600 dark:text-gray-300">
                      {view === "yearly" ? `Year ${row.year}` : row.date}
                    </td>
                    <td className="py-2 px-2 text-gray-500 dark:text-gray-400">{fmtRate(row.rate)}</td>
                    <td className="py-2 px-2 text-right">
                      {fmtINR(view === "yearly" ? row.emi ?? row.emiTotal : row.emi)}
                    </td>
                    <td className="py-2 px-2 text-right">
                      {fmtINR(view === "yearly" ? row.principalTotal ?? row.principal : row.principal)}
                    </td>
                    <td className="py-2 px-2 text-right text-amber-600 dark:text-amber-100">
                      {fmtINR(view === "yearly" ? row.interestTotal ?? row.interest : row.interest)}
                    </td>
                    <td className="py-2 px-2 text-right">{fmtINR(row.balance)}</td>
                    <td className="py-2 px-2">
                      {isPrepay ? (
                        <span className="badge-prepay">Prepay</span>
                      ) : (
                        <span className="badge-emi">EMI</span>
                      )}
                      {view === "yearly" && row.prepaymentTotal > 0 && (
                        <span className="badge-prepay ml-1">
                          +{fmtINR(row.prepaymentTotal)}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
