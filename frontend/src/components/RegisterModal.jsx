import { useState } from 'react';
import { createUser } from '../client';

export default function RegisterModal({ onLogin, onClose, onBackToLogin }) {
  const [username, setUsername] = useState('');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const id = await createUser({ username, passcode });
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
        <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">×</button>
        <h2 className="modal-title">Create account</h2>

        <div className="login-field">
          <label className="login-label" htmlFor="reg-username">Username</label>
          <input
            id="reg-username"
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
          <label className="login-label" htmlFor="reg-passcode">Passcode</label>
          <input
            id="reg-passcode"
            className="login-input"
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>

        {error && <p className="login-error">{error}</p>}

        <button
          className="btn btn-primary login-submit"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>

        <p className="login-modal-register">
          Already have an account?{' '}
          <button type="button" className="link-btn" onClick={onBackToLogin}>
            Sign in
          </button>
        </p>
      </form>
    </div>
  );
}
