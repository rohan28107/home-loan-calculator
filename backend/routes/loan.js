const express = require("express");
const router = express.Router();
const {
  calculateEMIController,
  getScheduleController,
  getPrepaymentImpactController,
} = require("../controllers/loanController");

// POST /api/loan/calculate
// Body: { principal, annualRate, tenureMonths }
router.post("/calculate", calculateEMIController);

// POST /api/loan/schedule
// Body: { principal, annualRate, tenureMonths, startDate, emiDay,
//         rateChanges: [{effectiveFrom, rate}],
//         prepayments: [{date, amount, note}],
//         view: "all" | "yearly" }
router.post("/schedule", getScheduleController);

// POST /api/loan/impact
// Body: same as /schedule — returns prepayment impact metrics
router.post("/impact", getPrepaymentImpactController);

module.exports = router;
