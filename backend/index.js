require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./db");
const loanRoutes = require("./routes/loan");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 4000;

connectDB();

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Home Loan Tracker API" });
});

// Routes
app.use("/api/loan", loanRoutes);
app.use("/api/auth", authRoutes);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
