import { useState } from 'react';
import { login } from '../client';
import { useUserId } from '../hooks/useUserId';

export default function LoginScreen({ onSuccess }) {
  const [, setUserId] = useUserId();
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
      setUserId(id);
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2 className="login-title">Sign in</h2>

        <div className="login-field">
          <label className="login-label" htmlFor="username">Username</label>
          <input
            id="username"
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
          <label className="login-label" htmlFor="passcode">Passcode</label>
          <input
            id="passcode"
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
      </form>
    </div>
  );
}
