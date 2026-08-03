import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function AssessmentModelPicker() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'en' ? 'en' : 'fa';
  const navigate = useNavigate();
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startingKey, setStartingKey] = useState(null);

  useEffect(() => {
    api.get('/assessment-models').then((res) => {
      setModels(res.data.models);
      setLoading(false);
    });
  }, []);

  async function handleSelect(key) {
    setStartingKey(key);
    try {
      const res = await api.post(`/assessment-models/${key}/instantiate`);
      navigate('/surveys/new', { state: { draft: res.data.survey } });
    } finally {
      setStartingKey(null);
    }
  }

  if (loading) return <p className="text-slate-500 text-sm">{t('common.loading')}</p>;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">{t('assessmentModels.pickerTitle')}</h1>
      <p className="text-slate-500 mb-6">{t('assessmentModels.pickerSubtitle')}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => navigate('/surveys/new')}
          className="card p-5 text-start hover:shadow-md transition-shadow border-dashed"
        >
          <div className="font-semibold text-slate-800 mb-1">{t('assessmentModels.blankSurvey')}</div>
          <p className="text-sm text-slate-500">{t('assessmentModels.blankSurveyDesc')}</p>
        </button>

        {models.map((m) => (
          <button
            key={m.key}
            type="button"
            disabled={startingKey === m.key}
            onClick={() => handleSelect(m.key)}
            className="card p-5 text-start hover:shadow-md transition-shadow disabled:opacity-60"
          >
            <div className="flex items-center justify-between mb-1 gap-2">
              <div className="font-semibold text-slate-800">{m.name?.[lang] || m.name?.fa}</div>
              <span className="badge bg-slate-100 text-slate-500 shrink-0">
                {t('assessmentModels.itemCount', { count: m.itemCount })}
              </span>
            </div>
            <p className="text-sm text-slate-500">{m.description?.[lang] || m.description?.fa}</p>
          </button>
        ))}
      </div>

      <p className="text-xs text-slate-400 mt-6">{t('assessmentModels.disclaimer')}</p>
    </div>
  );
}
