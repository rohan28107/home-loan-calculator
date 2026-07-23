# Home Loan Tracker

Full-stack home loan EMI calculator with floating rate support and prepayment tracking.

## Stack
- **Frontend**: React 18 + Vite + Tailwind CSS + Recharts
- **Backend**: Node.js + Express

---

## Project structure

```
home-loan-tracker/
├── backend/
│   ├── index.js                    # Express entry point
│   ├── package.json
│   ├── routes/
│   │   └── loan.js                 # API routes
│   ├── controllers/
│   │   └── loanController.js       # Request handlers & validation
│   └── utils/
│       └── loanCalculator.js       # Pure calculation functions
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js              # Proxy /api → localhost:4000
    ├── tailwind.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx                 # Root layout + tab routing
        ├── index.css               # Tailwind + component classes
        ├── api/
        │   └── loanApi.js          # Axios API client
        ├── hooks/
        │   └── useLoan.js          # Central state + API calls
        ├── utils/
        │   └── format.js           # INR, rate, ordinal formatters
        └── components/
            ├── DayPicker.jsx       # 1–31 calendar day grid
            ├── CalculatorTab.jsx   # EMI inputs + pie chart
            ├── RateChangesTab.jsx  # Floating rate history
            ├── PrepaymentsTab.jsx  # Prepayment log + impact
            ├── ScheduleTab.jsx     # Amortisation table
            └── SummaryTab.jsx      # Side-by-side comparison + progress
```
---

## Screenshots:
<img width="842" height="901" alt="image" src="https://github.com/user-attachments/assets/40e2a172-60fc-4726-9c77-82e7acc21e6e" />
<img width="832" height="747" alt="image" src="https://github.com/user-attachments/assets/8de06d6f-0db2-45ad-b758-fd32329b0a2b" />
<img width="840" height="721" alt="image" src="https://github.com/user-attachments/assets/ea622334-ddfa-4894-81d8-3ac4efe7dd22" />

---

## Setup & run

### 1. Backend

```bash
cd backend
npm install
npm run dev          # starts on http://localhost:4000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev          # starts on http://localhost:3000
```

Vite proxies `/api` requests to `http://localhost:4000`, so no CORS issues in dev.

---

## API endpoints

All endpoints: `POST /api/loan/...`

### `POST /api/loan/calculate`
Calculate fixed EMI.

**Body**
```json
{
  "principal": 5000000,
  "annualRate": 7.7,
  "tenureMonths": 240
}
```

**Response**
```json
{
  "emi": 41196.34,
  "totalInterest": 4887121.6,
  "totalPayment": 9887121.6,
  "interestToPrincipalRatio": 98
}
```

---

### `POST /api/loan/schedule`
Full amortisation schedule with rate changes and prepayments.

**Body**
```json
{
  "principal": 5000000,
  "annualRate": 7.7,
  "tenureMonths": 240,
  "startDate": "2024-01",
  "emiDay": 15,
  "view": "all",
  "rateChanges": [
    { "effectiveFrom": "2026-01", "rate": 7.45, "note": "RBI cut" }
  ],
  "prepayments": [
    { "date": "2025-03-15", "amount": 200000, "note": "Bonus" }
  ]
}
```

**Response**
```json
{
  "schedule": [ ... ],
  "summary": {
    "fixedEMI": 41196.34,
    "originalTenure": 240,
    "effectiveTenure": 228,
    "monthsSaved": 12,
    "originalTotalInterest": 4887121.6,
    "totalInterestPaid": 4510234.12,
    "interestSaved": 376887.48,
    "totalPrepaid": 200000,
    "outstandingBalance": 0,
    "percentRepaid": 100
  }
}
```

---

### `POST /api/loan/impact`
Prepayment impact compared to baseline (no prepayments).

**Body**: same as `/schedule`

**Response**
```json
{
  "totalPrepaid": 200000,
  "interestSaved": 376887.48,
  "monthsSaved": 12,
  "originalTenure": 234,
  "newTenure": 222
}
```

---

## Key behaviour

| Event | EMI | Tenure |
|---|---|---|
| Rate goes down | Unchanged | Shortens |
| Rate goes up | Unchanged | Extends |
| Prepayment made | Unchanged | Shortens |

This matches how most Indian banks handle floating rate home loans (EBLR-linked).
