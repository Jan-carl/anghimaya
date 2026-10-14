import { useState } from 'react';
import { portalApi } from '../lib/api.js';
import { useToast } from './Toast.jsx';

export function LoginGate({ onLoginSuccess }) {
  const { addToast } = useToast();
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await portalApi.login({
        passcode: passcode.trim(),
        email: email.trim() || undefined,
      });

      addToast('Maligayang pagdating sa Tanggapan ng Patnugutan.', 'success');
      onLoginSuccess(res.user);
    } catch (err) {
      const msg = err.message || 'Maling passcode o hindi maabot ang server.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo-wrap">
          <img src="./anghimayalogo.png" alt="Ang Himaya Sagisag" className="login-logo" />
        </div>

        <div className="login-eyebrow">
          Politeknikong Unibersidad ng Pilipinas · Lopez Campus
        </div>

        <h1 className="login-title">Tanggapan ng Patnugutan</h1>
        <p className="login-sub">
          Portal sa pamamahala ng mga balita, lathalain, kagyat na ulat, at opisyal na edisyon ng pahayagan.
        </p>

        {error ? <div className="login-error-box" role="alert">{error}</div> : null}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="login-passcode">
              Editorial Passcode
            </label>
            <div className="input-with-action">
              <input
                id="login-passcode"
                type={showPasscode ? 'text' : 'password'}
                className="form-input"
                placeholder="Ipasok ang editorial passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="input-eye-btn"
                onClick={() => setShowPasscode((s) => !s)}
                aria-label={showPasscode ? 'Itago ang passcode' : 'Ipakita ang passcode'}
                title={showPasscode ? 'Itago ang passcode' : 'Ipakita ang passcode'}
              >
                {showPasscode ? 'Itago' : 'Ipakita'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              Opisyal na Email (Opsiyonal)
            </label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="puplopezanghimaya@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--block btn--tall login-submit-btn"
            disabled={loading}
          >
            {loading ? 'Pumapasok sa tanggapan…' : 'Pumasok sa Tanggapan →'}
          </button>
        </form>

        <div className="login-footnote">
          Lihim na portal para lamang sa editorial board at mga awtorisadong patnugot ng Ang Himaya.
        </div>
      </div>
    </div>
  );
}