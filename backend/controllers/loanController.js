const {
  calculateEMI,
  buildSchedule,
  computeSummary,
  aggregateByYear,
  dateToMonthIndex,
} = require("../utils/loanCalculator");
const Loan = require("../models/Loan");

// ─── POST /api/loan/calculate ─────────────────────────────────────────────────
// Returns fixed EMI for given loan params.
const calculateEMIController = (req, res) => {
  try {
    const { principal, annualRate, tenureMonths } = req.body;
    const errors = validateBase({ principal, annualRate, tenureMonths });
    if (errors.length) return res.status(400).json({ errors });

    const emi = calculateEMI(
      Number(principal),
      Number(annualRate),
      Number(tenureMonths)
    );

    const totalPayment = emi * Number(tenureMonths);
    const totalInterest = totalPayment - Number(principal);

    return res.json({
      emi: round2(emi),
      totalInterest: round2(totalInterest),
      totalPayment: round2(totalPayment),
      interestToPrincipalRatio: Math.round((totalInterest / Number(principal)) * 100),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ─── POST /api/loan/schedule ──────────────────────────────────────────────────
// Returns full amortisation schedule with optional rate changes and prepayments.
const getScheduleController = (req, res) => {
  try {
    const {
      principal,
      annualRate,
      tenureMonths,
      startDate,
      emiDay = 15,
      rateChanges = [],
      prepayments = [],
      view = "all", // "all" | "yearly"
    } = req.body;

    const errors = validateBase({ principal, annualRate, tenureMonths });
    if (errors.length) return res.status(400).json({ errors });

    // Enrich rate changes and prepayments with month indices
    const enrichedRateChanges = rateChanges
      .map((rc) => ({
        ...rc,
        month: startDate ? dateToMonthIndex(startDate, rc.effectiveFrom) : rc.month,
        rate: Number(rc.rate),
      }))
      .filter((rc) => rc.month != null && rc.month >= 1)
      .sort((a, b) => a.month - b.month);

    const enrichedPrepayments = prepayments
      .map((pp) => ({
        ...pp,
        month: startDate ? dateToMonthIndex(startDate, pp.date?.slice(0, 7)) : pp.month,
        amount: Number(pp.amount),
      }))
      .filter((pp) => pp.month != null && pp.month >= 1)
      .sort((a, b) => a.month - b.month);

    const schedule = buildSchedule({
      principal: Number(principal),
      annualRate: Number(annualRate),
      tenureMonths: Number(tenureMonths),
      startDate,
      emiDay: Number(emiDay),
      rateChanges: enrichedRateChanges,
      prepayments: enrichedPrepayments,
    });

    const summary = computeSummary({
      schedule,
      principal: Number(principal),
      annualRate: Number(annualRate),
      tenureMonths: Number(tenureMonths),
      prepayments: enrichedPrepayments,
    });

    const data =
      view === "yearly" ? aggregateByYear(schedule) : schedule;

    return res.json({ schedule: data, summary });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ─── POST /api/loan/impact ─────────────────────────────────────────────────────
// Returns prepayment impact: interest saved, months saved.
const getPrepaymentImpactController = (req, res) => {
  try {
    const {
      principal,
      annualRate,
      tenureMonths,
      startDate,
      emiDay = 15,
      rateChanges = [],
      prepayments = [],
    } = req.body;

    const errors = validateBase({ principal, annualRate, tenureMonths });
    if (errors.length) return res.status(400).json({ errors });

    // Schedule WITHOUT prepayments (baseline)
    const baseSchedule = buildSchedule({
      principal: Number(principal),
      annualRate: Number(annualRate),
      tenureMonths: Number(tenureMonths),
      startDate,
      emiDay: Number(emiDay),
      rateChanges: rateChanges.map((rc) => ({
        ...rc,
        month: startDate ? dateToMonthIndex(startDate, rc.effectiveFrom) : rc.month,
        rate: Number(rc.rate),
      })),
      prepayments: [],
    });

    const enrichedPrepayments = prepayments
      .map((pp) => ({
        ...pp,
        month: startDate ? dateToMonthIndex(startDate, pp.date?.slice(0, 7)) : pp.month,
        amount: Number(pp.amount),
      }))
      .filter((pp) => pp.month != null && pp.month >= 1);

    // Schedule WITH prepayments
    const newSchedule = buildSchedule({
      principal: Number(principal),
      annualRate: Number(annualRate),
      tenureMonths: Number(tenureMonths),
      startDate,
      emiDay: Number(emiDay),
      rateChanges: rateChanges.map((rc) => ({
        ...rc,
        month: startDate ? dateToMonthIndex(startDate, rc.effectiveFrom) : rc.month,
        rate: Number(rc.rate),
      })),
      prepayments: enrichedPrepayments,
    });

    const baseInterest = baseSchedule.reduce((s, r) => s + r.interest, 0);
    const newInterest = newSchedule.reduce((s, r) => s + r.interest, 0);
    const baseTenure = baseSchedule.filter((r) => r.type === "emi").length;
    const newTenure = newSchedule.filter((r) => r.type === "emi").length;
    const totalPrepaid = enrichedPrepayments.reduce((s, p) => s + p.amount, 0);

    return res.json({
      totalPrepaid: round2(totalPrepaid),
      interestSaved: round2(Math.max(0, baseInterest - newInterest)),
      monthsSaved: Math.max(0, baseTenure - newTenure),
      originalTenure: baseTenure,
      newTenure,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ─── GET /api/loan/me ──────────────────────────────────────────────────────────
// Returns the signed-in user's saved loan, or { loan: null } if none saved yet.
const getMyLoanController = async (req, res) => {
  try {
    const loan = await Loan.findOne({ userId: req.userId });
    return res.json({ loan });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ─── PUT /api/loan/me ──────────────────────────────────────────────────────────
// Upserts the signed-in user's saved loan from the request body.
const saveMyLoanController = async (req, res) => {
  try {
    const {
      principal,
      annualRate,
      tenureMonths,
      startDate,
      emiDay,
      rateChanges = [],
      prepayments = [],
    } = req.body;

    const errors = validateBase({ principal, annualRate, tenureMonths });
    if (errors.length) return res.status(400).json({ errors });

    const loan = await Loan.findOneAndUpdate(
      { userId: req.userId },
      {
        principal: Number(principal),
        annualRate: Number(annualRate),
        tenureMonths: Number(tenureMonths),
        startDate,
        emiDay: Number(emiDay) || 15,
        rateChanges,
        prepayments,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return res.json({ loan });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function validateBase({ principal, annualRate, tenureMonths }) {
  const errors = [];
  if (!principal || Number(principal) <= 0) errors.push("principal must be > 0");
  if (!annualRate || Number(annualRate) <= 0) errors.push("annualRate must be > 0");
  if (!tenureMonths || Number(tenureMonths) < 1) errors.push("tenureMonths must be >= 1");
  return errors;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

module.exports = {
  calculateEMIController,
  getScheduleController,
  getPrepaymentImpactController,
  getMyLoanController,
  saveMyLoanController,
};
