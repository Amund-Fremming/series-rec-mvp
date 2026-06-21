import { useState } from 'react';
import { login } from '../client';

export default function LoginModal({ onLogin, onClose, onRegister }) {
  const [username, setUsername] = useState('');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const id = await login(username, passcode);
      onLogin(id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal login-modal" onSubmit={handleSubmit}>
        <h2 className="modal-title">Sign in</h2>

        <div className="login-field">
          <label className="login-label" htmlFor="modal-username">Username</label>
          <input
            id="modal-username"
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
          <label className="login-label" htmlFor="modal-passcode">Passcode</label>
          <input
            id="modal-passcode"
            className="login-input"
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        {error && <p className="login-error">{error}</p>}

        <button
          className="btn btn-primary login-submit"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="login-modal-register">
          Don't have an account?{' '}
          <button type="button" className="link-btn" onClick={onRegister}>
            Register here
          </button>
        </p>
      </form>
    </div>
  );
}
