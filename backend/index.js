const express = require("express");
const cors = require("cors");

const loanRoutes = require("./routes/loan");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Home Loan Tracker API" });
});

// Routes
app.use("/api/loan", loanRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
