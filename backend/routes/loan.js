const express = require("express");
const router = express.Router();
const {
  calculateEMIController,
  getScheduleController,
  getPrepaymentImpactController,
  getMyLoanController,
  saveMyLoanController,
} = require("../controllers/loanController");
const requireAuth = require("../middleware/requireAuth");

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

// GET /api/loan/me — the signed-in user's saved loan (or { loan: null })
router.get("/me", requireAuth, getMyLoanController);

// PUT /api/loan/me — upsert the signed-in user's saved loan
router.put("/me", requireAuth, saveMyLoanController);

module.exports = router;
