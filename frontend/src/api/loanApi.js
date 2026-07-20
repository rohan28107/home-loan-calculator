import axios from "axios";

const api = axios.create({ baseURL: "/api/loan" });

/** Calculate EMI for given loan params */
export const fetchEMI = (params) => api.post("/calculate", params);

/** Get full amortisation schedule */
export const fetchSchedule = (params) => api.post("/schedule", params);

/** Get prepayment impact metrics */
export const fetchPrepaymentImpact = (params) => api.post("/impact", params);
