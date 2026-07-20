/**
 * Calculate fixed monthly EMI using the standard formula.
 * @param {number} principal - Loan amount
 * @param {number} annualRate - Annual interest rate (%)
 * @param {number} tenureMonths - Loan tenure in months
 * @returns {number} Monthly EMI
 */
function calculateEMI(principal, annualRate, tenureMonths) {
  const mr = annualRate / 12 / 100;
  if (mr === 0) return principal / tenureMonths;
  return (
    (principal * mr * Math.pow(1 + mr, tenureMonths)) /
    (Math.pow(1 + mr, tenureMonths) - 1)
  );
}

/**
 * Build full amortisation schedule.
 * - EMI is fixed at loan start (floating rate only changes tenure, not EMI).
 * - Rate changes shorten (rate down) or extend (rate up) remaining tenure.
 * - Prepayments reduce balance directly, shortening tenure; EMI stays the same.
 *
 * @param {object} params
 * @param {number}   params.principal       - Loan amount
 * @param {number}   params.annualRate      - Initial annual interest rate (%)
 * @param {number}   params.tenureMonths    - Original loan tenure in months
 * @param {string}   params.startDate       - Loan start date "YYYY-MM"
 * @param {number}   params.emiDay          - Day of month EMI is due (1–31)
 * @param {Array}    params.rateChanges     - [{month, rate}] sorted by month
 * @param {Array}    params.prepayments     - [{month, amount, note}] sorted by month
 * @returns {Array} Schedule rows
 */
function buildSchedule({
  principal,
  annualRate,
  tenureMonths,
  startDate,
  emiDay,
  rateChanges = [],
  prepayments = [],
}) {
  const fixedEMI = calculateEMI(principal, annualRate, tenureMonths);

  const sortedRC = [...rateChanges].sort((a, b) => a.month - b.month);
  const sortedPP = [...prepayments].sort((a, b) => a.month - b.month);

  let balance = principal;
  let currentRate = annualRate;
  let rcIdx = 0;
  let ppIdx = 0;
  const schedule = [];
  const maxMonths = tenureMonths + 120; // buffer for rate-up scenarios

  for (let m = 1; m <= maxMonths && balance > 0.5; m++) {
    // Apply any rate change effective this month
    while (rcIdx < sortedRC.length && sortedRC[rcIdx].month === m) {
      currentRate = sortedRC[rcIdx].rate;
      rcIdx++;
    }

    const mr = currentRate / 12 / 100;
    const interestPart = balance * mr;
    let principalPart = fixedEMI - interestPart;
    if (principalPart < 0) principalPart = 0;
    if (principalPart > balance) principalPart = balance;

    balance -= principalPart;
    if (balance < 0) balance = 0;

    schedule.push({
      month: m,
      date: getMonthLabel(startDate, m, emiDay),
      rate: currentRate,
      emi: round2(principalPart + interestPart),
      principal: round2(principalPart),
      interest: round2(interestPart),
      balance: round2(balance),
      type: "emi",
    });

    // Apply prepayments for this month
    while (ppIdx < sortedPP.length && sortedPP[ppIdx].month === m) {
      const pp = sortedPP[ppIdx];
      const ppAmt = Math.min(pp.amount, balance);
      balance -= ppAmt;
      if (balance < 0) balance = 0;

      schedule.push({
        month: m,
        date: pp.date || getMonthLabel(startDate, m, emiDay),
        rate: currentRate,
        emi: round2(ppAmt),
        principal: round2(ppAmt),
        interest: 0,
        balance: round2(balance),
        type: "prepayment",
        note: pp.note || "",
      });
      ppIdx++;
    }

    if (balance < 0.5) break;
  }

  return schedule;
}

/**
 * Compute summary metrics from a schedule.
 */
function computeSummary({ schedule, principal, annualRate, tenureMonths, prepayments = [] }) {
  const fixedEMI = calculateEMI(principal, annualRate, tenureMonths);
  const origTotalInterest = fixedEMI * tenureMonths - principal;

  const emiRows = schedule.filter((r) => r.type === "emi");
  const effectiveTenure = emiRows.length;
  const totalInterestPaid = schedule.reduce((s, r) => s + r.interest, 0);
  const totalPrepaid = prepayments.reduce((s, p) => s + p.amount, 0);
  const totalEMIPaid = emiRows.reduce((s, r) => s + r.emi, 0);
  const interestSaved = origTotalInterest - totalInterestPaid;
  const monthsSaved = tenureMonths - effectiveTenure;

  const lastRow = schedule[schedule.length - 1];
  const outstandingBalance = lastRow ? lastRow.balance : principal;

  return {
    fixedEMI: round2(fixedEMI),
    originalTenure: tenureMonths,
    effectiveTenure,
    monthsSaved: Math.max(0, monthsSaved),
    originalTotalInterest: round2(origTotalInterest),
    totalInterestPaid: round2(totalInterestPaid),
    interestSaved: round2(Math.max(0, interestSaved)),
    totalEMIPaid: round2(totalEMIPaid),
    totalPrepaid: round2(totalPrepaid),
    totalOutflow: round2(totalEMIPaid + totalPrepaid),
    outstandingBalance: round2(outstandingBalance),
    principalRepaid: round2(principal - outstandingBalance),
    percentRepaid: Math.min(100, Math.round(((principal - outstandingBalance) / principal) * 100)),
  };
}

/**
 * Aggregate monthly schedule into yearly summary rows.
 */
function aggregateByYear(schedule) {
  const years = {};
  schedule.forEach((row) => {
    const yr = Math.ceil(row.month / 12);
    if (!years[yr]) {
      years[yr] = {
        year: yr,
        emiTotal: 0,
        principalTotal: 0,
        interestTotal: 0,
        prepaymentTotal: 0,
        balance: 0,
        rate: row.rate,
      };
    }
    if (row.type === "prepayment") {
      years[yr].prepaymentTotal += row.principal;
    } else {
      years[yr].emiTotal += row.emi;
      years[yr].principalTotal += row.principal;
      years[yr].interestTotal += row.interest;
      years[yr].rate = row.rate;
    }
    years[yr].balance = row.balance;
  });

  return Object.values(years).map((y) => ({
    ...y,
    emiTotal: round2(y.emiTotal),
    principalTotal: round2(y.principalTotal),
    interestTotal: round2(y.interestTotal),
    prepaymentTotal: round2(y.prepaymentTotal),
    balance: round2(y.balance),
  }));
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function round2(n) {
  return Math.round(n * 100) / 100;
}

function getMonthLabel(startDate, monthIndex, emiDay = 1) {
  if (!startDate) return `Month ${monthIndex}`;
  const d = new Date(startDate + "-01");
  d.setMonth(d.getMonth() + monthIndex - 1);
  const day = Math.min(emiDay, 28); // safe cap for display
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Convert a "YYYY-MM" date string to a loan month index (1-based).
 */
function dateToMonthIndex(startDate, targetDate) {
  if (!startDate || !targetDate) return null;
  const s = new Date(startDate + "-01");
  const t = new Date(targetDate + "-01");
  return (
    (t.getFullYear() - s.getFullYear()) * 12 +
    (t.getMonth() - s.getMonth()) +
    1
  );
}

module.exports = {
  calculateEMI,
  buildSchedule,
  computeSummary,
  aggregateByYear,
  dateToMonthIndex,
};
