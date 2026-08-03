import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LogoPlaceholder from '../components/common/LogoPlaceholder';

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch {
      setError(t('auth.loginError'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-brand-50 via-slate-50 to-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <LogoPlaceholder className="h-16 w-16 mb-3" />
          <h1 className="text-lg font-bold text-slate-900">{t('common.appName')}</h1>
        </div>

        <form onSubmit={handleSubmit} className="card p-8">
          <h2 className="text-base font-semibold text-slate-800 mb-6 text-center">{t('auth.loginTitle')}</h2>
          {error && (
            <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>
          )}
          <div className="mb-4">
            <label className="label-field">{t('auth.email')}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              dir="ltr"
            />
          </div>
          <div className="mb-6">
            <label className="label-field">{t('auth.password')}</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              dir="ltr"
            />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full py-2.5">
            {t('auth.loginButton')}
          </button>
        </form>
      </div>
    </div>
  );
}
