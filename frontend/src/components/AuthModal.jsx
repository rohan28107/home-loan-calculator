import { useState } from "react";

export default function AuthModal({ authError, signUp, signIn, onClose, onAuthed }) {
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const ok = mode === "signup" ? await signUp(email, password) : await signIn(email, password);
    setSubmitting(false);
    if (ok) onAuthed();
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div className="card w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex gap-4 mb-4 border-b border-gray-100 dark:border-gray-700">
          {["signin", "signup"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={[
                "pb-2 text-sm border-b-2 transition-all -mb-px",
                mode === m
                  ? "border-brand-400 text-brand-600 font-medium dark:text-brand-200"
                  : "border-transparent text-gray-500 dark:text-gray-400",
              ].join(" ")}
            >
              {m === "signin" ? "Sign in" : "Sign up"}
            </button>
          ))}
        </div>

        {authError && (
          <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg
                          dark:bg-red-950 dark:border-red-900 dark:text-red-300">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full justify-center" disabled={submitting}>
            {submitting ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
