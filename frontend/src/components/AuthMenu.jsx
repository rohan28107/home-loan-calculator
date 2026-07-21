import { useState } from "react";
import AuthModal from "./AuthModal";

export default function AuthMenu({ user, authError, signUp, signIn, signOut }) {
  const [modalOpen, setModalOpen] = useState(false);

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[9rem]" title={user.email}>
          {user.email}
        </span>
        <button onClick={signOut} className="btn-ghost">
          Sign out
        </button>
      </div>
    );
  }

  return (
    <>
      <button onClick={() => setModalOpen(true)} className="btn-ghost">
        Sign in
      </button>
      {modalOpen && (
        <AuthModal
          authError={authError}
          signUp={signUp}
          signIn={signIn}
          onClose={() => setModalOpen(false)}
          onAuthed={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
