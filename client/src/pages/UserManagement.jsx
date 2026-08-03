import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const MAX_MEMBERS = 10;

function emptyForm() {
  return { name: '', email: '', password: '' };
}

export default function UserManagement() {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [creating, setCreating] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  async function load() {
    setLoading(true);
    const res = await api.get('/users');
    setUsers(res.data.users);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const memberCount = users.filter((u) => u.role === 'member' && u.active).length;

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCreating(true);
    try {
      await api.post('/users', form);
      setForm(emptyForm());
      setSuccess(t('users.createSuccess'));
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Error');
    } finally {
      setCreating(false);
    }
  }

  async function handleToggleActive(user) {
    if (user.active && !window.confirm(t('users.confirmDeactivate'))) return;
    setTogglingId(user._id);
    try {
      await api.patch(`/users/${user._id}/active`, { active: !user.active });
      load();
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(user) {
    if (!window.confirm(t('users.confirmDelete'))) return;
    setDeletingId(user._id);
    try {
      await api.delete(`/users/${user._id}`);
      load();
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) return <p className="text-slate-500 text-sm">{t('common.loading')}</p>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('users.title')}</h1>
        <span className="badge bg-brand-50 text-brand-700 self-start sm:self-auto">
          {t('users.countLabel', { count: memberCount, max: MAX_MEMBERS })}
        </span>
      </div>

      <div className="card p-5 mb-6">
        <h2 className="section-title mb-4">{t('users.addUser')}</h2>
        {error && <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
        {success && (
          <div className="mb-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">{success}</div>
        )}
        {memberCount >= MAX_MEMBERS ? (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">{t('users.limitReached')}</p>
        ) : (
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="label-field">{t('users.name')}</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="label-field">{t('users.email')}</label>
              <input
                type="email"
                required
                dir="ltr"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="label-field">{t('users.password')}</label>
              <input
                type="text"
                required
                minLength={6}
                dir="ltr"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-field"
              />
            </div>
            <div className="md:col-span-3 flex justify-end">
              <button type="submit" disabled={creating} className="btn-primary">
                + {t('users.addUser')}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase tracking-wide">
              <th className="text-start px-5 py-3 font-medium">{t('users.name')}</th>
              <th className="text-start px-5 py-3 font-medium">{t('users.email')}</th>
              <th className="text-start px-5 py-3 font-medium">{t('users.role')}</th>
              <th className="text-start px-5 py-3 font-medium">{t('users.status')}</th>
              <th className="text-start px-5 py-3 font-medium">{t('users.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t border-slate-100 hover:bg-slate-50/70 transition-colors">
                <td className="px-5 py-3.5 text-slate-800 font-medium">{u.name}</td>
                <td className="px-5 py-3.5 text-slate-500" dir="ltr">
                  {u.email}
                </td>
                <td className="px-5 py-3.5">
                  <span className={`badge ${u.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-600'}`}>
                    {t(`users.role_${u.role}`)}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`badge gap-1.5 ${u.active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${u.active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    {t(u.active ? 'users.active' : 'users.inactive')}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  {u.role !== 'admin' && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={togglingId === u._id}
                        onClick={() => handleToggleActive(u)}
                        className={u.active ? 'btn-danger-ghost' : 'btn-ghost'}
                      >
                        {t(u.active ? 'users.deactivate' : 'users.activate')}
                      </button>
                      <button
                        type="button"
                        disabled={deletingId === u._id}
                        onClick={() => handleDelete(u)}
                        className="btn-danger-ghost"
                      >
                        {t('common.delete')}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
