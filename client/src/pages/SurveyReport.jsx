import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import StatCard from '../components/charts/StatCard';
import FrequencyBarChart from '../components/charts/FrequencyBarChart';
import PersianDatePicker from '../components/common/PersianDatePicker';
import ModelReportSection from '../components/report/ModelReportSection';

function pct(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return `${Math.round(value * 100)}%`;
}

export default function SurveyReport() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'en' ? 'en' : 'fa';

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  async function load() {
    setLoading(true);
    const params = {};
    if (fromDate) params.startDate = fromDate;
    if (toDate) params.endDate = toDate;
    const res = await api.get(`/surveys/${id}/report`, { params });
    setReport(res.data);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleExport(type) {
    const params = {};
    if (fromDate) params.startDate = fromDate;
    if (toDate) params.endDate = toDate;
    params.lang = lang;
    const res = await api.get(`/surveys/${id}/export/${type}`, { params, responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `survey-${id}.${type === 'excel' ? 'xlsx' : 'csv'}`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  if (loading || !report) return <p className="text-slate-500 text-sm">{t('common.loading')}</p>;

  const { metrics, questionStats, survey, model } = report;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">{t('survey.report.title')}</h1>
      <p className="text-slate-500 mb-6">{survey.title?.[lang] || survey.title?.fa}</p>

      <div className="flex flex-wrap items-end gap-3 mb-6 card p-4">
        <div>
          <label className="label-field">{t('survey.report.fromDate')}</label>
          <div className="w-40">
            <PersianDatePicker value={fromDate} onChange={setFromDate} />
          </div>
        </div>
        <div>
          <label className="label-field">{t('survey.report.toDate')}</label>
          <div className="w-40">
            <PersianDatePicker value={toDate} onChange={setToDate} />
          </div>
        </div>
        <button type="button" onClick={load} className="btn-primary">
          {t('survey.report.applyFilter')}
        </button>
        <div className="ms-auto flex gap-2">
          <button type="button" onClick={() => handleExport('csv')} className="btn-secondary">
            📄 {t('survey.report.exportCsv')}
          </button>
          <button type="button" onClick={() => handleExport('excel')} className="btn-secondary">
            📊 {t('survey.report.exportExcel')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label={t('survey.report.totalStarted')} value={metrics.allStarted} />
        <StatCard label={t('survey.report.totalCompleted')} value={metrics.completedCount} />
        <StatCard label={t('survey.report.completionRate')} value={pct(metrics.completionRate)} accent />
        <StatCard label={t('survey.report.participationRate')} value={pct(metrics.participationRate)} accent />
      </div>

      <ModelReportSection model={model} />

      {metrics.completedCount === 0 ? (
        <div className="card flex flex-col items-center justify-center text-center py-16 px-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-2xl mb-4 shadow-sm shadow-brand-700/25">📊</div>
          <p className="text-slate-500">{t('survey.report.noResponses')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {questionStats.map((q) => (
            <div key={q.questionId} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-800 text-sm">{q.title?.[lang] || q.title?.fa}</h3>
                <span className="badge bg-slate-100 text-slate-500">
                  {q.answeredCount} {t('survey.report.answeredCount')}
                </span>
              </div>

              {q.frequency && <FrequencyBarChart frequency={q.frequency} />}

              {q.rowStats && (
                <div className="space-y-4">
                  {q.rowStats.map((row, i) => (
                    <div key={i}>
                      <div className="text-xs font-medium text-slate-500 mb-1.5">{row.row?.[lang] || row.row?.fa}</div>
                      <FrequencyBarChart frequency={row.frequency} />
                    </div>
                  ))}
                </div>
              )}

              {q.stats && (
                <div className="grid grid-cols-3 gap-3">
                  <StatCard label={t('survey.report.average')} value={q.stats.avg !== null ? q.stats.avg.toFixed(2) : '—'} />
                  <StatCard label={t('survey.report.min')} value={q.stats.min ?? '—'} />
                  <StatCard label={t('survey.report.max')} value={q.stats.max ?? '—'} />
                </div>
              )}

              {!q.frequency && !q.rowStats && !q.stats && (
                <p className="text-xs text-slate-400">{q.answeredCount} responses (text answers not summarized)</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
