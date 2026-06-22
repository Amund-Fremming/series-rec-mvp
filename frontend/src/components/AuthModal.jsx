import { useState } from "react";
import { login, createUser } from "../client";

export default function AuthModal({ onLogin, onClose, initialMode = "login" }) {
  const [mode, setMode] = useState(initialMode);
  const [username, setUsername] = useState("");
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const id = isLogin
        ? await login(username, passcode)
        : await createUser({ username, passcode });
      onLogin(id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setMode(isLogin ? "register" : "login");
    setError(null);
  }

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <form className="modal login-modal" onSubmit={handleSubmit}>
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="modal-title">{isLogin ? "Sign in" : "Create account"}</h2>

        <div className="login-field">
          <label className="login-label" htmlFor="auth-username">
            Username
          </label>
          <input
            id="auth-username"
            className="login-input"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoFocus
            required
          />
        </div>

        <div className="login-field">
          <label className="login-label" htmlFor="auth-passcode">
            Passcode
          </label>
          <input
            id="auth-passcode"
            className="login-input"
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            autoComplete={isLogin ? "current-password" : "new-password"}
            required
          />
        </div>

        {error && <p className="login-error">{error}</p>}

        <button
          className="btn btn-primary login-submit"
          type="submit"
          disabled={loading}
        >
          {loading
            ? isLogin
              ? "Signing in…"
              : "Creating account…"
            : isLogin
              ? "Sign in"
              : "Create account"}
        </button>

        <p className="login-modal-register">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button type="button" className="link-btn" onClick={switchMode}>
            {isLogin ? "Register here" : "Sign in"}
          </button>
        </p>
      </form>
    </div>
  );
}
