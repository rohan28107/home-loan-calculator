import { fmtINR, fmtRate, ordinal } from "../utils/format";

export default function SummaryTab({ loan, summary, rateChanges, prepayments, loading }) {
  if (!summary || loading) {
    return <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-12">Calculating...</p>;
  }

  const pct = summary.percentRepaid;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Original loan */}
        <div className="card">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">Original loan</h3>
          <div className="info-row">
            <span className="text-gray-500 dark:text-gray-400">Loan amount</span>
            <span>{fmtINR(loan.principal)}</span>
          </div>
          <div className="info-row">
            <span className="text-gray-500 dark:text-gray-400">Initial rate</span>
            <span>{fmtRate(loan.annualRate)}</span>
          </div>
          <div className="info-row">
            <span className="text-gray-500 dark:text-gray-400">Fixed EMI</span>
            <span className="font-medium">{fmtINR(summary.fixedEMI)}</span>
          </div>
          <div className="info-row">
            <span className="text-gray-500 dark:text-gray-400">Original tenure</span>
            <span>{loan.tenureMonths} months · {(loan.tenureMonths / 12).toFixed(1)} yrs</span>
          </div>
          <div className="info-row">
            <span className="text-gray-500 dark:text-gray-400">Total interest</span>
            <span className="text-amber-600 dark:text-amber-100">{fmtINR(summary.originalTotalInterest)}</span>
          </div>
          <div className="info-row">
            <span className="text-gray-500 dark:text-gray-400">EMI due</span>
            <span>{ordinal(loan.emiDay)} of every month</span>
          </div>
        </div>

        {/* Current projection */}
        <div className="card">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">Current projection</h3>
          <div className="info-row">
            <span className="text-gray-500 dark:text-gray-400">Current rate</span>
            <span>
              {rateChanges.length > 0
                ? fmtRate(rateChanges[rateChanges.length - 1].rate)
                : fmtRate(loan.annualRate)}
            </span>
          </div>
          <div className="info-row">
            <span className="text-gray-500 dark:text-gray-400">EMI (unchanged)</span>
            <span className="font-medium">{fmtINR(summary.fixedEMI)}</span>
          </div>
          <div className="info-row">
            <span className="text-gray-500 dark:text-gray-400">Effective tenure</span>
            <span>{summary.effectiveTenure} months · {(summary.effectiveTenure / 12).toFixed(1)} yrs</span>
          </div>
          <div className="info-row">
            <span className="text-gray-500 dark:text-gray-400">Total prepaid</span>
            <span>{fmtINR(summary.totalPrepaid)}</span>
          </div>
          <div className="info-row">
            <span className="text-gray-500 dark:text-gray-400">Revised interest</span>
            <span className="text-amber-600 dark:text-amber-100">{fmtINR(summary.totalInterestPaid)}</span>
          </div>
          <div className="info-row">
            <span className="text-gray-500 dark:text-gray-400">Interest saved</span>
            <span className="text-brand-600 dark:text-brand-200 font-medium">{fmtINR(summary.interestSaved)}</span>
          </div>
          <div className="info-row">
            <span className="text-gray-500 dark:text-gray-400">Months saved</span>
            <span className="text-brand-600 dark:text-brand-200 font-medium">{summary.monthsSaved} months</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="card">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">Loan progress</h3>
        <div className="info-row mb-2">
          <span className="text-gray-500 dark:text-gray-400">Principal repaid</span>
          <span>{fmtINR(summary.principalRepaid)} / {fmtINR(loan.principal)}</span>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-400 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">{pct}% of principal cleared</p>

        <div className="mt-4 space-y-0">
          <div className="info-row">
            <span className="text-gray-500 dark:text-gray-400">Outstanding balance</span>
            <span>{fmtINR(summary.outstandingBalance)}</span>
          </div>
          <div className="info-row">
            <span className="text-gray-500 dark:text-gray-400">Rate changes recorded</span>
            <span>{rateChanges.length}</span>
          </div>
          <div className="info-row">
            <span className="text-gray-500 dark:text-gray-400">Prepayments made</span>
            <span>
              {prepayments.length}
              {prepayments.length > 0 && ` · ${fmtINR(summary.totalPrepaid)}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
