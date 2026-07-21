import { client } from "./client";

const api = {
  post: (path, body) => client.post(`/api/loan${path}`, body),
  get: (path) => client.get(`/api/loan${path}`),
  put: (path, body) => client.put(`/api/loan${path}`, body),
};

/** Calculate EMI for given loan params */
export const fetchEMI = (params) => api.post("/calculate", params);

/** Get full amortisation schedule */
export const fetchSchedule = (params) => api.post("/schedule", params);

/** Get prepayment impact metrics */
export const fetchPrepaymentImpact = (params) => api.post("/impact", params);

/** Get the signed-in user's saved loan (requires auth) */
export const fetchMyLoan = () => api.get("/me");

/** Save/update the signed-in user's loan (requires auth) */
export const saveMyLoan = (params) => api.put("/me", params);
