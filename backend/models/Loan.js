const mongoose = require("mongoose");

const rateChangeSchema = new mongoose.Schema(
  {
    effectiveFrom: String,
    rate: Number,
    note: String,
  },
  { _id: false }
);

const prepaymentSchema = new mongoose.Schema(
  {
    date: String,
    amount: Number,
    note: String,
  },
  { _id: false }
);

const loanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  principal: Number,
  annualRate: Number,
  tenureMonths: Number,
  startDate: String,
  emiDay: Number,
  rateChanges: [rateChangeSchema],
  prepayments: [prepaymentSchema],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Loan", loanSchema);
