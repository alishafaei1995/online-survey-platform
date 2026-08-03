import { useTranslation } from 'react-i18next';
import { generateObjectId } from '../../utils/objectId';
import PersianDatePicker from '../common/PersianDatePicker';

const TYPES = ['single_choice', 'multiple_choice', 'likert', 'text', 'numeric', 'date', 'matrix'];
const OPTION_TYPES = ['single_choice', 'multiple_choice', 'likert', 'matrix'];

function emptyOption() {
  return { value: generateObjectId().slice(-6), label: { fa: '', en: '' } };
}

export default function QuestionEditor({ question, index, earlierQuestions, onChange, onRemove, dragHandleProps }) {
  const { t } = useTranslation();

  function update(patch) {
    onChange({ ...question, ...patch });
  }

  function updateOption(list, optIndex, patch) {
    const next = list.slice();
    next[optIndex] = { ...next[optIndex], ...patch };
    return next;
  }

  const dependsOnQuestion = earlierQuestions.find((q) => q._id === question.conditional?.dependsOn);
  const dependsOnHasOptions = dependsOnQuestion && OPTION_TYPES.includes(dependsOnQuestion.type);

  return (
    <div className="card p-4 mb-3 transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3">
        <div
          {...dragHandleProps}
          className="cursor-grab text-slate-300 hover:text-slate-500 pt-2 select-none transition-colors"
          title="drag"
        >
          ⠿
        </div>
        <div className="flex-1 space-y-3.5">
          <div className="flex flex-wrap gap-2.5 items-center">
            <span className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-white text-xs font-semibold flex items-center justify-center shrink-0">
              {index + 1}
            </span>
            <select
              value={question.type}
              onChange={(e) => update({ type: e.target.value })}
              className="input-field w-auto py-1.5"
            >
              {TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`survey.builder.questionTypes.${type}`)}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-1.5 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={!!question.required}
                onChange={(e) => update({ required: e.target.checked })}
                className="w-4 h-4 rounded accent-brand-600"
              />
              {t('survey.builder.required')}
            </label>
            <button type="button" onClick={onRemove} className="btn-danger-ghost ms-auto">
              {t('survey.builder.removeQuestion')}
            </button>
          </div>

          {question.modelItemKey && (
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
              ⚠ {t('survey.builder.modelLinkedBadge')}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              placeholder={t('survey.builder.questionTitleFa')}
              value={question.title?.fa || ''}
              onChange={(e) => update({ title: { ...question.title, fa: e.target.value } })}
              className="input-field"
              dir="rtl"
            />
            <input
              placeholder={t('survey.builder.questionTitleEn')}
              value={question.title?.en || ''}
              onChange={(e) => update({ title: { ...question.title, en: e.target.value } })}
              className="input-field"
              dir="ltr"
            />
          </div>

          {OPTION_TYPES.includes(question.type) && (
            <div className="bg-slate-50/70 rounded-lg p-3">
              <div className="text-xs font-medium text-slate-500 mb-2">
                {question.type === 'matrix' ? t('survey.builder.matrixColumns') : t('survey.builder.options')}
              </div>
              {(question.options || []).map((opt, i) => (
                <div key={opt.value} className="flex flex-col sm:flex-row gap-2 mb-1.5">
                  <input
                    placeholder={t('survey.builder.optionLabelFa')}
                    value={opt.label?.fa || ''}
                    onChange={(e) => update({ options: updateOption(question.options, i, { label: { ...opt.label, fa: e.target.value } }) })}
                    className="input-field bg-white flex-1 py-1.5"
                    dir="rtl"
                  />
                  <input
                    placeholder={t('survey.builder.optionLabelEn')}
                    value={opt.label?.en || ''}
                    onChange={(e) => update({ options: updateOption(question.options, i, { label: { ...opt.label, en: e.target.value } }) })}
                    className="input-field bg-white flex-1 py-1.5"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => update({ options: question.options.filter((_, idx) => idx !== i) })}
                    className="text-slate-400 hover:text-red-500 text-xs px-2 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => update({ options: [...(question.options || []), emptyOption()] })}
                className="btn-ghost mt-1"
              >
                + {t('survey.builder.addOption')}
              </button>
            </div>
          )}

          {question.type === 'matrix' && (
            <div className="bg-slate-50/70 rounded-lg p-3">
              <div className="text-xs font-medium text-slate-500 mb-2">{t('survey.builder.matrixRows')}</div>
              {(question.matrixRows || []).map((row, i) => (
                <div key={row.value} className="flex flex-col sm:flex-row gap-2 mb-1.5">
                  <input
                    placeholder={t('survey.builder.optionLabelFa')}
                    value={row.label?.fa || ''}
                    onChange={(e) => update({ matrixRows: updateOption(question.matrixRows, i, { label: { ...row.label, fa: e.target.value } }) })}
                    className="input-field bg-white flex-1 py-1.5"
                    dir="rtl"
                  />
                  <input
                    placeholder={t('survey.builder.optionLabelEn')}
                    value={row.label?.en || ''}
                    onChange={(e) => update({ matrixRows: updateOption(question.matrixRows, i, { label: { ...row.label, en: e.target.value } }) })}
                    className="input-field bg-white flex-1 py-1.5"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => update({ matrixRows: question.matrixRows.filter((_, idx) => idx !== i) })}
                    className="text-slate-400 hover:text-red-500 text-xs px-2 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => update({ matrixRows: [...(question.matrixRows || []), emptyOption()] })}
                className="btn-ghost mt-1"
              >
                + {t('survey.builder.addRow')}
              </button>
            </div>
          )}

          {question.type === 'numeric' && (
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="number"
                placeholder={t('survey.builder.validationMin')}
                value={question.validation?.min ?? ''}
                onChange={(e) => update({ validation: { ...question.validation, min: e.target.value === '' ? undefined : Number(e.target.value) } })}
                className="input-field w-full sm:w-40"
              />
              <input
                type="number"
                placeholder={t('survey.builder.validationMax')}
                value={question.validation?.max ?? ''}
                onChange={(e) => update({ validation: { ...question.validation, max: e.target.value === '' ? undefined : Number(e.target.value) } })}
                className="input-field w-full sm:w-40"
              />
            </div>
          )}

          {question.type === 'date' && (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="w-full sm:w-40">
                <PersianDatePicker
                  value={question.validation?.minDate}
                  onChange={(value) => update({ validation: { ...question.validation, minDate: value || undefined } })}
                  className="input-field w-full"
                />
              </div>
              <div className="w-full sm:w-40">
                <PersianDatePicker
                  value={question.validation?.maxDate}
                  onChange={(value) => update({ validation: { ...question.validation, maxDate: value || undefined } })}
                  className="input-field w-full"
                />
              </div>
            </div>
          )}

          {question.type === 'text' && (
            <input
              placeholder={t('survey.builder.validationRegex')}
              value={question.validation?.regex || ''}
              onChange={(e) => update({ validation: { ...question.validation, regex: e.target.value || undefined } })}
              className="input-field"
              dir="ltr"
            />
          )}

          {earlierQuestions.length > 0 && (
            <div className="border-t border-slate-100 pt-3">
              <div className="text-xs font-medium text-slate-500 mb-2">{t('survey.builder.conditional')}</div>
              <div className="flex flex-wrap gap-2 items-center">
                <select
                  value={question.conditional?.dependsOn || ''}
                  onChange={(e) =>
                    update({
                      conditional: e.target.value
                        ? { dependsOn: e.target.value, operator: 'equals', value: '' }
                        : undefined,
                    })
                  }
                  className="input-field w-auto py-1.5"
                >
                  <option value="">{t('survey.builder.conditionalNone')}</option>
                  {earlierQuestions.map((q) => (
                    <option key={q._id} value={q._id}>
                      {q.title?.fa || q.title?.en || `#${q._id}`}
                    </option>
                  ))}
                </select>

                {question.conditional?.dependsOn && (
                  <>
                    <select
                      value={question.conditional?.operator || 'equals'}
                      onChange={(e) => update({ conditional: { ...question.conditional, operator: e.target.value } })}
                      className="input-field w-auto py-1.5"
                    >
                      <option value="equals">{t('survey.builder.operator_equals')}</option>
                      <option value="notEquals">{t('survey.builder.operator_notEquals')}</option>
                      <option value="contains">{t('survey.builder.operator_contains')}</option>
                    </select>

                    {dependsOnHasOptions ? (
                      <select
                        value={question.conditional?.value || ''}
                        onChange={(e) => update({ conditional: { ...question.conditional, value: e.target.value } })}
                        className="input-field w-auto py-1.5"
                      >
                        <option value="">—</option>
                        {dependsOnQuestion.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label?.fa || opt.label?.en || opt.value}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        placeholder={t('survey.builder.conditionalValue')}
                        value={question.conditional?.value || ''}
                        onChange={(e) => update({ conditional: { ...question.conditional, value: e.target.value } })}
                        className="input-field w-auto py-1.5"
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
