import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

export default function ChangePassword() {
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError(t('account.passwordMismatch'));
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      setSuccess(t('account.updateSuccess'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-6 text-center">{t('account.changePasswordTitle')}</h1>
      <form onSubmit={handleSubmit} className="card p-6">
        {error && <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
        {success && (
          <div className="mb-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">{success}</div>
        )}
        <div className="mb-4">
          <label className="label-field">{t('account.currentPassword')}</label>
          <input
            type="password"
            required
            dir="ltr"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="input-field"
          />
        </div>
        <div className="mb-4">
          <label className="label-field">{t('account.newPassword')}</label>
          <input
            type="password"
            required
            minLength={6}
            dir="ltr"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="input-field"
          />
        </div>
        <div className="mb-6">
          <label className="label-field">{t('account.confirmNewPassword')}</label>
          <input
            type="password"
            required
            dir="ltr"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input-field"
          />
        </div>
        <button type="submit" disabled={submitting} className="btn-primary w-full py-2.5">
          {t('account.updateButton')}
        </button>
      </form>
    </div>
  );
}
