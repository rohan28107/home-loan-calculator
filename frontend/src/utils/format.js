/** Format number as Indian Rupee string */
export const fmtINR = (n) =>
  "₹" + Math.round(n).toLocaleString("en-IN");

/** Format rate with 2 decimal places */
export const fmtRate = (r) => `${Number(r).toFixed(2)}%`;

/** Ordinal suffix: 1 → "1st", 2 → "2nd", etc. */
export const ordinal = (d) => {
  const s = ["th", "st", "nd", "rd"];
  const v = d % 100;
  return d + (s[(v - 20) % 10] || s[v] || s[0]);
};

/** Convert "YYYY-MM" to "Jan 2026" */
export const fmtYearMonth = (yyyymm) => {
  if (!yyyymm) return "";
  const [y, m] = yyyymm.split("-");
  const date = new Date(Number(y), Number(m) - 1, 1);
  return date.toLocaleString("en-IN", { month: "short", year: "numeric" });
};
