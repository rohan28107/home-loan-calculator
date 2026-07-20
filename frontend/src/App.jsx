import { useState } from "react";
import { useLoan } from "./hooks/useLoan";
import { useTheme } from "./hooks/useTheme";
import ThemeToggle from "./components/ThemeToggle";
import CalculatorTab from "./components/CalculatorTab";
import RateChangesTab from "./components/RateChangesTab";
import PrepaymentsTab from "./components/PrepaymentsTab";
import ScheduleTab from "./components/ScheduleTab";
import SummaryTab from "./components/SummaryTab";

const TABS = [
  { id: "calculator", label: "EMI calculator" },
  { id: "rates",      label: "Rate changes" },
  { id: "prepayments",label: "Prepayments" },
  { id: "schedule",   label: "Schedule" },
  { id: "summary",    label: "Summary" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("calculator");
  const { theme, toggleTheme } = useTheme();
  const {
    loan, updateLoan,
    rateChanges, addRateChange, removeRateChange,
    prepayments, addPrepayment, removePrepayment,
    summary, schedule, impact, loading, error,
  } = useLoan();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Home loan tracker</h1>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
              Floating rate · Prepayments · Full amortisation
            </p>
          </div>
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>

        {/* API error */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl
                          dark:bg-red-950 dark:border-red-900 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-0 border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={[
                "px-4 py-2.5 text-sm whitespace-nowrap border-b-2 transition-all",
                activeTab === t.id
                  ? "border-brand-400 text-brand-600 font-medium dark:text-brand-200"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
              ].join(" ")}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "calculator" && (
          <CalculatorTab loan={loan} updateLoan={updateLoan} summary={summary} loading={loading} />
        )}
        {activeTab === "rates" && (
          <RateChangesTab
            loan={loan}
            rateChanges={rateChanges}
            addRateChange={addRateChange}
            removeRateChange={removeRateChange}
          />
        )}
        {activeTab === "prepayments" && (
          <PrepaymentsTab
            prepayments={prepayments}
            addPrepayment={addPrepayment}
            removePrepayment={removePrepayment}
            impact={impact}
          />
        )}
        {activeTab === "schedule" && (
          <ScheduleTab schedule={schedule} loading={loading} />
        )}
        {activeTab === "summary" && (
          <SummaryTab
            loan={loan}
            summary={summary}
            rateChanges={rateChanges}
            prepayments={prepayments}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}
