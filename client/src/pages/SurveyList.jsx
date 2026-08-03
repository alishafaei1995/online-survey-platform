import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const statusStyles = {
  draft: { badge: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
  scheduled: { badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  active: { badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  closed: { badge: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
};

export default function SurveyList() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  async function load() {
    setLoading(true);
    const res = await api.get('/surveys');
    setSurveys(res.data.surveys);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDuplicate(id) {
    const res = await api.post(`/surveys/${id}/duplicate`);
    navigate(`/surveys/${res.data.survey._id}`);
  }

  async function handleDelete(id) {
    if (!window.confirm(t('common.confirmDeleteBody'))) return;
    setDeletingId(id);
    await api.delete(`/surveys/${id}`);
    setDeletingId(null);
    load();
  }

  if (loading) return <p className="text-slate-500 text-sm">{t('common.loading')}</p>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('survey.list.title')}</h1>
          {surveys.length > 0 && (
            <p className="text-sm text-slate-500 mt-0.5">
              {surveys.length} {t('survey.list.title')}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2 self-start sm:self-auto">
          <Link to="/surveys/new/from-model" className="btn-secondary">
            {t('survey.list.createFromModel')}
          </Link>
          <Link to="/surveys/new" className="btn-primary">
            <span className="text-base leading-none">+</span> {t('survey.list.createNew')}
          </Link>
        </div>
      </div>

      {surveys.length === 0 ? (
        <div className="card flex flex-col items-center justify-center text-center py-16 px-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-2xl mb-4 shadow-sm shadow-brand-700/25">📋</div>
          <p className="text-slate-500 mb-5">{t('survey.list.empty')}</p>
          <Link to="/surveys/new" className="btn-primary">
            {t('survey.list.createNew')}
          </Link>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase tracking-wide">
                <th className="text-start px-5 py-3 font-medium">{t('survey.list.titleColumn')}</th>
                {isAdmin && <th className="text-start px-5 py-3 font-medium">{t('survey.list.owner')}</th>}
                <th className="text-start px-5 py-3 font-medium">{t('survey.builder.status')}</th>
                <th className="text-start px-5 py-3 font-medium">{t('survey.list.createdAt')}</th>
                <th className="text-start px-5 py-3 font-medium">{t('survey.list.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {surveys.map((s) => {
                const status = statusStyles[s.status] || statusStyles.draft;
                return (
                  <tr key={s._id} className="border-t border-slate-100 hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <Link to={`/surveys/${s._id}`} className="text-slate-800 hover:text-brand-700 font-medium transition-colors">
                        {s.title?.[i18n.language] || s.title?.fa || s.title?.en || '(بدون عنوان)'}
                      </Link>
                    </td>
                    {isAdmin && (
                      <td className="px-5 py-3.5 text-slate-500">{s.createdBy?.name || '—'}</td>
                    )}
                    <td className="px-5 py-3.5">
                      <span className={`badge gap-1.5 ${status.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {t(`survey.list.status_${s.status}`)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {new Date(s.createdAt).toLocaleDateString(i18n.language === 'fa' ? 'fa-IR' : 'en-US')}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap items-center gap-1">
                        <Link to={`/surveys/${s._id}`} className="btn-ghost">
                          {t('common.edit')}
                        </Link>
                        <Link to={`/surveys/${s._id}/report`} className="btn-ghost">
                          {t('survey.list.report')}
                        </Link>
                        <Link to={`/surveys/${s._id}/share`} className="btn-ghost">
                          {t('survey.list.share')}
                        </Link>
                        <button type="button" onClick={() => handleDuplicate(s._id)} className="btn-ghost">
                          {t('survey.list.duplicate')}
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === s._id}
                          onClick={() => handleDelete(s._id)}
                          className="btn-danger-ghost"
                        >
                          {t('common.delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
