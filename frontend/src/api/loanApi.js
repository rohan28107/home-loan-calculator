import axios from "axios";

const baseURL = `${import.meta.env.VITE_API_BASE_URL ?? ""}/api/loan`;

const api = axios.create({ baseURL });

/** Calculate EMI for given loan params */
export const fetchEMI = (params) => api.post("/calculate", params);

/** Get full amortisation schedule */
export const fetchSchedule = (params) => api.post("/schedule", params);

/** Get prepayment impact metrics */
export const fetchPrepaymentImpact = (params) => api.post("/impact", params);
