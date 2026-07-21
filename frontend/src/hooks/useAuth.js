import { useState, useCallback, useEffect } from "react";
import { signup, signin, fetchMe } from "../api/authApi";

/**
 * Manages the optional signed-in session: restores it from a stored token
 * on mount, and exposes sign up / sign in / sign out.
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setAuthLoading(false);
      return;
    }
    fetchMe()
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setAuthLoading(false));
  }, []);

  const applyAuthResponse = (res) => {
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
  };

  const signUp = useCallback(async (email, password) => {
    setAuthError(null);
    try {
      applyAuthResponse(await signup(email, password));
      return true;
    } catch (err) {
      setAuthError(err.response?.data?.errors?.join(", ") || err.message);
      return false;
    }
  }, []);

  const signIn = useCallback(async (email, password) => {
    setAuthError(null);
    try {
      applyAuthResponse(await signin(email, password));
      return true;
    } catch (err) {
      setAuthError(err.response?.data?.errors?.join(", ") || err.message);
      return false;
    }
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
  }, []);

  return { user, authLoading, authError, signUp, signIn, signOut };
}
