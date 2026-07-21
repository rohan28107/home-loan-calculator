import { client } from "./client";

/** Create a new account */
export const signup = (email, password) =>
  client.post("/api/auth/signup", { email, password });

/** Sign in to an existing account */
export const signin = (email, password) =>
  client.post("/api/auth/signin", { email, password });

/** Fetch the currently signed-in user (validates the stored token) */
export const fetchMe = () => client.get("/api/auth/me");
