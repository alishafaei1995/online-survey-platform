import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { generateObjectId } from '../utils/objectId';
import SortableQuestionList from '../components/builder/SortableQuestionList';
import PersianDateTimePicker from '../components/common/PersianDateTimePicker';

function emptySurvey() {
  return {
    title: { fa: '', en: '' },
    description: { fa: '', en: '' },
    welcomeMessage: { fa: '', en: '' },
    endMessage: { fa: '', en: '' },
    status: 'draft',
    schedule: { startAt: '', endAt: '' },
    questions: [],
    settings: {
      allowAnonymous: true,
      preventDuplicate: true,
      ipRestriction: { enabled: false, maxPerIp: 1 },
      targetCount: undefined,
    },
  };
}

function emptyQuestion() {
  return {
    _id: generateObjectId(),
    type: 'single_choice',
    title: { fa: '', en: '' },
    required: false,
    options: [],
    matrixRows: [],
    validation: {},
    conditional: undefined,
  };
}

function SectionHeader({ icon, title }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="icon-badge">{icon}</span>
      <h2 className="section-title">{title}</h2>
    </div>
  );
}

export default function SurveyBuilder() {
  const { t } = useTranslation();
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  // AssessmentModelPicker navigates here with a pre-built draft (questions + scoring
  // already populated) in router state instead of an empty survey.
  const [survey, setSurvey] = useState(location.state?.draft || emptySurvey());
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isNew) return;
    api.get(`/surveys/${id}`).then((res) => {
      const s = res.data.survey;
      setSurvey({
        ...s,
        schedule: {
          startAt: s.schedule?.startAt || '',
          endAt: s.schedule?.endAt || '',
        },
      });
      setLoading(false);
    });
  }, [id, isNew]);

  function updateField(path, value) {
    setSurvey((prev) => {
      const next = structuredClone(prev);
      const keys = path.split('.');
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  }

  function handleAddQuestion() {
    setSurvey((prev) => ({ ...prev, questions: [...prev.questions, emptyQuestion()] }));
  }

  function handleChangeQuestion(index, updated) {
    setSurvey((prev) => {
      const questions = prev.questions.slice();
      questions[index] = updated;
      return { ...prev, questions };
    });
  }

  function handleRemoveQuestion(index) {
    setSurvey((prev) => ({ ...prev, questions: prev.questions.filter((_, i) => i !== index) }));
  }

  async function handleSave() {
    setError('');
    if (!survey.title.fa && !survey.title.en) {
      setError(t('survey.builder.titleFa'));
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...survey,
        schedule: {
          startAt: survey.schedule.startAt ? new Date(survey.schedule.startAt).toISOString() : undefined,
          endAt: survey.schedule.endAt ? new Date(survey.schedule.endAt).toISOString() : undefined,
        },
      };
      if (isNew) {
        const res = await api.post('/surveys', payload);
        navigate(`/surveys/${res.data.survey._id}`);
      } else {
        await api.put(`/surveys/${id}`, payload);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-slate-500 text-sm">{t('common.loading')}</p>;

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-6">
        {isNew ? t('survey.builder.newSurveyTitle') : t('survey.builder.editSurveyTitle')}
      </h1>

      {error && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>
      )}

      <section className="card p-5 mb-5">
        <SectionHeader icon="📝" title={t('survey.builder.newSurveyTitle')} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label-field">{t('survey.builder.titleFa')}</label>
            <input value={survey.title.fa} onChange={(e) => updateField('title.fa', e.target.value)} className="input-field" dir="rtl" />
          </div>
          <div>
            <label className="label-field">{t('survey.builder.titleEn')}</label>
            <input value={survey.title.en} onChange={(e) => updateField('title.en', e.target.value)} className="input-field" dir="ltr" />
          </div>
          <div>
            <label className="label-field">{t('survey.builder.descriptionFa')}</label>
            <textarea
              value={survey.description.fa}
              onChange={(e) => updateField('description.fa', e.target.value)}
              className="input-field"
              dir="rtl"
              rows={2}
            />
          </div>
          <div>
            <label className="label-field">{t('survey.builder.descriptionEn')}</label>
            <textarea
              value={survey.description.en}
              onChange={(e) => updateField('description.en', e.target.value)}
              className="input-field"
              dir="ltr"
              rows={2}
            />
          </div>
          <div>
            <label className="label-field">{t('survey.builder.welcomeMessage')} (FA)</label>
            <textarea
              value={survey.welcomeMessage.fa}
              onChange={(e) => updateField('welcomeMessage.fa', e.target.value)}
              className="input-field"
              dir="rtl"
              rows={2}
            />
          </div>
          <div>
            <label className="label-field">{t('survey.builder.welcomeMessage')} (EN)</label>
            <textarea
              value={survey.welcomeMessage.en}
              onChange={(e) => updateField('welcomeMessage.en', e.target.value)}
              className="input-field"
              dir="ltr"
              rows={2}
            />
          </div>
          <div>
            <label className="label-field">{t('survey.builder.endMessage')} (FA)</label>
            <textarea
              value={survey.endMessage.fa}
              onChange={(e) => updateField('endMessage.fa', e.target.value)}
              className="input-field"
              dir="rtl"
              rows={2}
            />
          </div>
          <div>
            <label className="label-field">{t('survey.builder.endMessage')} (EN)</label>
            <textarea
              value={survey.endMessage.en}
              onChange={(e) => updateField('endMessage.en', e.target.value)}
              className="input-field"
              dir="ltr"
              rows={2}
            />
          </div>
        </div>
      </section>

      <section className="card p-5 mb-5">
        <SectionHeader icon="🗓️" title={t('survey.builder.schedule')} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label-field">{t('survey.builder.status')}</label>
            <select value={survey.status} onChange={(e) => updateField('status', e.target.value)} className="input-field">
              <option value="draft">{t('survey.list.status_draft')}</option>
              <option value="active">{t('survey.list.status_active')}</option>
              <option value="closed">{t('survey.list.status_closed')}</option>
            </select>
          </div>
          <div>
            <label className="label-field">{t('survey.builder.startAt')}</label>
            <PersianDateTimePicker value={survey.schedule.startAt} onChange={(value) => updateField('schedule.startAt', value)} />
          </div>
          <div>
            <label className="label-field">{t('survey.builder.endAt')}</label>
            <PersianDateTimePicker value={survey.schedule.endAt} onChange={(value) => updateField('schedule.endAt', value)} />
          </div>
        </div>
      </section>

      <section className="card p-5 mb-5">
        <SectionHeader icon="⚙️" title={t('survey.builder.settings')} />
        <div className="flex flex-wrap gap-x-6 gap-y-3 items-center">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={survey.settings.allowAnonymous}
              onChange={(e) => updateField('settings.allowAnonymous', e.target.checked)}
              className="w-4 h-4 rounded accent-brand-600"
            />
            {t('survey.builder.allowAnonymous')}
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={survey.settings.preventDuplicate}
              onChange={(e) => updateField('settings.preventDuplicate', e.target.checked)}
              className="w-4 h-4 rounded accent-brand-600"
            />
            {t('survey.builder.preventDuplicate')}
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={survey.settings.ipRestriction?.enabled}
              onChange={(e) => updateField('settings.ipRestriction.enabled', e.target.checked)}
              className="w-4 h-4 rounded accent-brand-600"
            />
            {t('survey.builder.ipRestriction')}
          </label>
          {survey.settings.ipRestriction?.enabled && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-600">{t('survey.builder.maxPerIp')}</label>
              <input
                type="number"
                min={1}
                value={survey.settings.ipRestriction?.maxPerIp || 1}
                onChange={(e) => updateField('settings.ipRestriction.maxPerIp', Number(e.target.value))}
                className="input-field w-20"
              />
            </div>
          )}
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">{t('survey.builder.targetCount')}</label>
            <input
              type="number"
              min={0}
              value={survey.settings.targetCount ?? ''}
              onChange={(e) => updateField('settings.targetCount', e.target.value === '' ? undefined : Number(e.target.value))}
              className="input-field w-24"
            />
          </div>
        </div>
      </section>

      <section className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="icon-badge">❓</span>
            <h2 className="section-title">{t('survey.builder.questions')}</h2>
            {survey.questions.length > 0 && (
              <span className="badge bg-slate-100 text-slate-500">{survey.questions.length}</span>
            )}
          </div>
          <button type="button" onClick={handleAddQuestion} className="btn-secondary">
            + {t('survey.builder.addQuestion')}
          </button>
        </div>
        {survey.questions.length === 0 ? (
          <div className="card border-dashed py-10 text-center text-sm text-slate-400">{t('survey.builder.addQuestion')}</div>
        ) : (
          <SortableQuestionList
            questions={survey.questions}
            onReorder={(questions) => setSurvey((prev) => ({ ...prev, questions }))}
            onChangeQuestion={handleChangeQuestion}
            onRemoveQuestion={handleRemoveQuestion}
          />
        )}
      </section>

      <div className="sticky bottom-4 flex justify-end">
        <button type="button" onClick={handleSave} disabled={saving} className="btn-primary px-8 py-2.5 text-base">
          {t('survey.builder.saveSurvey')}
        </button>
      </div>
    </div>
  );
}
