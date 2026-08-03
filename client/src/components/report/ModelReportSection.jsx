import { useTranslation } from 'react-i18next';
import RadarProfileChart from '../charts/assessment/RadarProfileChart';
import QuadrantScatterChart from '../charts/assessment/QuadrantScatterChart';
import StatCard from '../charts/StatCard';

export default function ModelReportSection({ model }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'en' ? 'en' : 'fa';

  if (!model) return null;

  const modelName = model.name?.[lang] || model.name?.fa;

  return (
    <div className="card p-5 mb-4">
      <h3 className="font-semibold text-slate-800 mb-4">
        {t('survey.report.modelSectionTitle')} — {modelName}
      </h3>

      {model.chart?.type === 'radar' &&
        (model.sampleSize > 0 ? (
          <div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <StatCard label={t('survey.report.sampleSize')} value={model.sampleSize} />
              <StatCard
                label={t('survey.report.dominantResult')}
                value={model.derived?.dominantStyle?.name?.[lang] || model.derived?.dominantStyle?.name?.fa || '—'}
                accent
              />
            </div>
            <RadarProfileChart dimensions={model.dimensions} scores={model.scores} />
          </div>
        ) : (
          <p className="text-sm text-slate-400">{t('survey.report.noResponses')}</p>
        ))}

      {model.chart?.type === 'quadrantScatter' &&
        (model.subjects.length === 0 ? (
          <p className="text-sm text-slate-400">{t('survey.report.noSubjects')}</p>
        ) : (
          <>
            <QuadrantScatterChart
              xDimension={model.dimensions.find((d) => d.key === model.chart.xDimension)}
              yDimension={model.dimensions.find((d) => d.key === model.chart.yDimension)}
              subjects={model.subjects}
            />
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm min-w-[560px]">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase tracking-wide">
                    <th className="text-start px-3 py-2 font-medium">{t('survey.report.subjectColumn')}</th>
                    <th className="text-start px-3 py-2 font-medium">{t('survey.report.raterColumn')}</th>
                    <th className="text-start px-3 py-2 font-medium">{t('survey.report.relationshipColumn')}</th>
                    {model.dimensions.map((d) => (
                      <th key={d.key} className="text-start px-3 py-2 font-medium">
                        {d.name?.[lang] || d.name?.fa}
                      </th>
                    ))}
                    <th className="text-start px-3 py-2 font-medium">{t('survey.report.resultColumn')}</th>
                  </tr>
                </thead>
                <tbody>
                  {model.subjects.map((s) => {
                    const derivedVal = Object.values(s.derived || {})[0];
                    return (
                      <tr key={s.responseId} className="border-t border-slate-100">
                        <td className="px-3 py-2 text-slate-800">{s.subjectName || '—'}</td>
                        <td className="px-3 py-2 text-slate-500">{s.raterName || '—'}</td>
                        <td className="px-3 py-2 text-slate-500">
                          {s.raterRelationship ? t(`survey.share.relationship_${s.raterRelationship}`) : '—'}
                        </td>
                        {model.dimensions.map((d) => (
                          <td key={d.key} className="px-3 py-2 text-slate-600">
                            {s.scores[d.key] != null ? s.scores[d.key].toFixed(2) : '—'}
                          </td>
                        ))}
                        <td className="px-3 py-2 text-slate-800 font-medium">
                          {derivedVal?.label?.[lang] || derivedVal?.label?.fa || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        ))}
    </div>
  );
}
