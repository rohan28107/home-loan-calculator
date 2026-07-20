import { ordinal } from "../utils/format";

export default function DayPicker({ value, onChange }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-gray-500 dark:text-gray-400">EMI due day</span>
        <span className="text-xs font-medium text-brand-600 dark:text-brand-200">
          {ordinal(value)} of every month
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
          const isSelected = day === value;
          return (
            <button
              key={day}
              onClick={() => onChange(day)}
              className={[
                "py-1.5 text-xs rounded-md border transition-all duration-100 leading-none select-none",
                isSelected
                  ? "bg-brand-400 border-brand-400 text-white font-medium scale-110 shadow-sm shadow-brand-200 ring-2 ring-brand-200 dark:ring-brand-400/40 dark:shadow-none"
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-300 dark:hover:border-brand-400 dark:hover:text-brand-200 dark:hover:bg-brand-400/10",
              ].join(" ")}
              aria-label={`EMI due on ${ordinal(day)}`}
              aria-pressed={isSelected}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
