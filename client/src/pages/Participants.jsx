import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

function emptyForm() {
  return { name: '', email: '', department: '' };
}

export default function Participants() {
  const { t } = useTranslation();
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [creating, setCreating] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  async function load() {
    setLoading(true);
    const res = await api.get('/participants');
    setParticipants(res.data.participants);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCreating(true);
    try {
      await api.post('/participants', form);
      setForm(emptyForm());
      setSuccess(t('participants.createSuccess'));
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Error');
    } finally {
      setCreating(false);
    }
  }

  async function handleToggleActive(participant) {
    setTogglingId(participant._id);
    try {
      await api.patch(`/participants/${participant._id}/active`, { active: !participant.active });
      load();
    } finally {
      setTogglingId(null);
    }
  }

  if (loading) return <p className="text-slate-500 text-sm">{t('common.loading')}</p>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('participants.title')}</h1>
        <p className="text-sm text-slate-500 mt-0.5">{t('participants.subtitle')}</p>
      </div>

      <div className="card p-5 mb-6">
        <h2 className="section-title mb-4">{t('participants.addParticipant')}</h2>
        {error && <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
        {success && (
          <div className="mb-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">{success}</div>
        )}
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="label-field">{t('participants.name')}</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="label-field">{t('participants.email')}</label>
            <input
              type="email"
              dir="ltr"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="label-field">{t('participants.department')}</label>
            <input
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="input-field"
            />
          </div>
          <div className="md:col-span-3 flex justify-end">
            <button type="submit" disabled={creating} className="btn-primary">
              + {t('participants.addParticipant')}
            </button>
          </div>
        </form>
      </div>

      {participants.length === 0 ? (
        <div className="card flex flex-col items-center justify-center text-center py-16 px-4">
          <p className="text-slate-500">{t('participants.empty')}</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase tracking-wide">
                <th className="text-start px-5 py-3 font-medium">{t('participants.name')}</th>
                <th className="text-start px-5 py-3 font-medium">{t('participants.email')}</th>
                <th className="text-start px-5 py-3 font-medium">{t('participants.department')}</th>
                <th className="text-start px-5 py-3 font-medium">{t('participants.status')}</th>
                <th className="text-start px-5 py-3 font-medium">{t('participants.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((p) => (
                <tr key={p._id} className="border-t border-slate-100 hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5 text-slate-800 font-medium">{p.name}</td>
                  <td className="px-5 py-3.5 text-slate-500" dir="ltr">
                    {p.email || '—'}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">{p.department || '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className={`badge gap-1.5 ${p.active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${p.active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      {t(p.active ? 'participants.active' : 'participants.inactive')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      type="button"
                      disabled={togglingId === p._id}
                      onClick={() => handleToggleActive(p)}
                      className={p.active ? 'btn-danger-ghost' : 'btn-ghost'}
                    >
                      {t(p.active ? 'participants.deactivate' : 'participants.activate')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
