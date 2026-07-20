import { useState, useCallback, useEffect } from "react";
import { fetchSchedule, fetchPrepaymentImpact } from "../api/loanApi";

const today = new Date();
const defaultStartDate = today.toISOString().slice(0, 7);

const DEFAULT_LOAN = {
  principal: 5000000,
  annualRate: 7.7,
  tenureMonths: 240,
  startDate: defaultStartDate,
  emiDay: 15,
};

export function useLoan() {
  const [loan, setLoan] = useState(DEFAULT_LOAN);
  const [rateChanges, setRateChanges] = useState([]);
  const [prepayments, setPrepayments] = useState([]);

  const [summary, setSummary] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [impact, setImpact] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const recalculate = useCallback(
    async (overrideLoan, overrideRC, overridePP) => {
      const l = overrideLoan ?? loan;
      const rc = overrideRC ?? rateChanges;
      const pp = overridePP ?? prepayments;

      if (!l.principal || !l.annualRate || !l.tenureMonths) return;
      setLoading(true);
      setError(null);
      try {
        const [schedRes, impactRes] = await Promise.all([
          fetchSchedule({
            ...l,
            rateChanges: rc.map((r) => ({
              effectiveFrom: r.effectiveFrom,
              rate: r.rate,
            })),
            prepayments: pp.map((p) => ({
              date: p.date,
              amount: p.amount,
              note: p.note,
            })),
            view: "all",
          }),
          pp.length > 0
            ? fetchPrepaymentImpact({
                ...l,
                rateChanges: rc.map((r) => ({
                  effectiveFrom: r.effectiveFrom,
                  rate: r.rate,
                })),
                prepayments: pp.map((p) => ({
                  date: p.date,
                  amount: p.amount,
                  note: p.note,
                })),
              })
            : Promise.resolve(null),
        ]);
        setSchedule(schedRes.data.schedule);
        setSummary(schedRes.data.summary);
        setImpact(impactRes ? impactRes.data : null);
      } catch (err) {
        setError(err.response?.data?.errors?.join(", ") || err.message);
      } finally {
        setLoading(false);
      }
    },
    [loan, rateChanges, prepayments]
  );

  // Recalculate whenever inputs change
  useEffect(() => {
    recalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loan, rateChanges, prepayments]);

  // ── Loan field update ──────────────────────────────────────────────────────
  const updateLoan = (field, value) => {
    setLoan((prev) => ({ ...prev, [field]: value }));
  };

  // ── Rate changes ───────────────────────────────────────────────────────────
  const addRateChange = ({ effectiveFrom, rate, note }) => {
    if (!effectiveFrom || !rate) return "Please enter a valid month and rate.";
    // Replace if same month already exists
    setRateChanges((prev) => {
      const filtered = prev.filter((r) => r.effectiveFrom !== effectiveFrom);
      return [...filtered, { id: Date.now(), effectiveFrom, rate: Number(rate), note }]
        .sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom));
    });
    return null;
  };

  const removeRateChange = (id) => {
    setRateChanges((prev) => prev.filter((r) => r.id !== id));
  };

  // ── Prepayments ───────────────────────────────────────────────────────────
  const addPrepayment = ({ date, amount, note }) => {
    if (!date || !amount || Number(amount) <= 0)
      return "Please enter a valid date and amount.";
    setPrepayments((prev) =>
      [...prev, { id: Date.now(), date, amount: Number(amount), note }].sort(
        (a, b) => a.date.localeCompare(b.date)
      )
    );
    return null;
  };

  const removePrepayment = (id) => {
    setPrepayments((prev) => prev.filter((p) => p.id !== id));
  };

  return {
    loan,
    updateLoan,
    rateChanges,
    addRateChange,
    removeRateChange,
    prepayments,
    addPrepayment,
    removePrepayment,
    summary,
    schedule,
    impact,
    loading,
    error,
  };
}
