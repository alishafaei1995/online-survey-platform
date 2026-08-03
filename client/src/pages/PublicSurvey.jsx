import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { getRespondentToken } from '../utils/respondentToken';
import { isQuestionVisible, validateVisibleAnswers } from '../utils/conditional';
import QuestionRenderer from '../components/renderer/QuestionRenderer';
import LogoPlaceholder from '../components/common/LogoPlaceholder';

const PAGE_BG = 'min-h-screen bg-gradient-to-b from-brand-50 via-slate-50 to-slate-50 px-4';

export default function PublicSurvey() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'en' ? 'en' : 'fa';

  const [phase, setPhase] = useState('loading');
  const [data, setData] = useState(null);
  const [responseId, setResponseId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // An invite link (360/9-Box) carries its own respondentToken in the URL — use it
  // instead of self-generating one, so the pre-provisioned Response is reused.
  const invitedToken = searchParams.get('respondentToken');
  const respondentToken = invitedToken || getRespondentToken(id);

  useEffect(() => {
    api.get(`/public/surveys/${id}`, { params: { respondentToken } }).then((res) => {
      const body = res.data;
      if (!body.open) {
        setPhase(body.state === 'not_published' ? 'notPublished' : body.state === 'ended' ? 'ended' : 'notStarted');
        setData(body);
        return;
      }
      if (body.alreadySubmitted) {
        setPhase('alreadySubmitted');
        setData(body);
        return;
      }
      setData(body.survey);
      setPhase('welcome');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleStart() {
    const res = await api.post(`/public/surveys/${id}/start`, { respondentToken });
    setResponseId(res.data.responseId);
    setPhase('taking');
  }

  function setAnswer(questionId, value) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setErrors((prev) => ({ ...prev, [questionId]: false }));
  }

  async function handleSubmit() {
    setSubmitError('');
    const validationErrors = validateVisibleAnswers(data.questions, answers);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setSubmitting(true);
    try {
      const answerList = Object.entries(answers).map(([questionId, value]) => ({ questionId, value }));
      const res = await api.post(`/public/surveys/${id}/submit`, {
        responseId,
        respondentToken,
        answers: answerList,
      });
      setData((prev) => ({ ...prev, endMessage: res.data.endMessage }));
      setPhase('done');
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Error');
    } finally {
      setSubmitting(false);
    }
  }

  if (phase === 'loading') {
    return (
      <div className={`${PAGE_BG} flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-2 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
          <span className="text-sm">{t('survey.take.loadingSurvey')}</span>
        </div>
      </div>
    );
  }

  if (['notPublished', 'notStarted', 'ended', 'alreadySubmitted'].includes(phase)) {
    const messageKey = { notPublished: 'notPublished', notStarted: 'notStarted', ended: 'ended', alreadySubmitted: 'alreadySubmitted' }[phase];
    const icon = { notPublished: '🚧', notStarted: '⏳', ended: '🔒', alreadySubmitted: '✅' }[phase];
    return (
      <div className={`${PAGE_BG} flex items-center justify-center`}>
        <div className="card p-8 max-w-md text-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center text-2xl mx-auto mb-4">{icon}</div>
          <h1 className="font-bold text-lg text-slate-900 mb-2">{data?.title?.[lang] || data?.title?.fa}</h1>
          <p className="text-slate-500">{t(`survey.take.${messageKey}`)}</p>
        </div>
      </div>
    );
  }

  if (phase === 'welcome') {
    return (
      <div className={`${PAGE_BG} flex items-center justify-center`}>
        <div className="card p-8 max-w-lg text-center">
          <LogoPlaceholder className="h-14 w-14 mx-auto mb-5" />
          <h1 className="font-bold text-xl text-slate-900 mb-3">{data.title?.[lang] || data.title?.fa}</h1>
          {data.description?.[lang] && <p className="text-slate-500 mb-4">{data.description[lang]}</p>}
          {data.welcomeMessage?.[lang] && <p className="text-slate-600 mb-6">{data.welcomeMessage[lang]}</p>}
          <button type="button" onClick={handleStart} className="btn-primary px-8 py-2.5 text-base">
            {t('survey.take.start')} ←
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className={`${PAGE_BG} flex items-center justify-center`}>
        <div className="card p-8 max-w-lg text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-3xl mx-auto mb-5">🎉</div>
          <h1 className="font-bold text-lg text-slate-900 mb-2">{t('survey.take.thankYou')}</h1>
          {data.endMessage?.[lang] && <p className="text-slate-600">{data.endMessage[lang]}</p>}
        </div>
      </div>
    );
  }

  const visibleQuestions = data.questions.filter((q) => isQuestionVisible(q, answers));
  const answeredCount = visibleQuestions.filter((q) => {
    const v = answers[q._id];
    return v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0);
  }).length;
  const progress = visibleQuestions.length ? Math.round((answeredCount / visibleQuestions.length) * 100) : 0;

  return (
    <div className={`${PAGE_BG} py-8`}>
      <div className="max-w-xl mx-auto">
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>{data.title?.[lang] || data.title?.fa}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-brand-400 to-brand-700 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="card p-6 sm:p-8">
          {submitError && (
            <div className="mb-5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{submitError}</div>
          )}
          {visibleQuestions.map((q) => (
            <QuestionRenderer
              key={q._id}
              question={q}
              value={answers[q._id]}
              onChange={(value) => setAnswer(q._id, value)}
              error={errors[q._id]}
            />
          ))}
          <button type="button" onClick={handleSubmit} disabled={submitting} className="btn-primary w-full py-3 text-base">
            {t('survey.take.submitButton')}
          </button>
        </div>
      </div>
    </div>
  );
}
