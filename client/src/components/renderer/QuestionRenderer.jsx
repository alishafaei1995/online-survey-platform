import { useTranslation } from 'react-i18next';
import PersianDatePicker from '../common/PersianDatePicker';

function OptionRow({ children, checked }) {
  return (
    <label
      className={`flex items-center gap-3 rounded-lg border px-3.5 py-2.5 text-sm cursor-pointer transition-colors ${
        checked
          ? 'border-brand-400 bg-brand-50/70 text-brand-900'
          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
      }`}
    >
      {children}
    </label>
  );
}

export default function QuestionRenderer({ question, value, onChange, error }) {
  const { i18n, t } = useTranslation();
  const lang = i18n.language === 'en' ? 'en' : 'fa';
  const label = question.title?.[lang] || question.title?.fa || question.title?.en;

  function renderInput() {
    switch (question.type) {
      case 'single_choice':
      case 'likert':
        return (
          <div className="space-y-2">
            {question.options.map((opt) => {
              const checked = value === opt.value;
              return (
                <OptionRow key={opt.value} checked={checked}>
                  <input
                    type="radio"
                    name={question._id}
                    checked={checked}
                    onChange={() => onChange(opt.value)}
                    className="w-4 h-4 accent-brand-600"
                  />
                  {opt.label?.[lang] || opt.label?.fa}
                </OptionRow>
              );
            })}
          </div>
        );
      case 'multiple_choice':
        return (
          <div className="space-y-2">
            {question.options.map((opt) => {
              const arr = Array.isArray(value) ? value : [];
              const checked = arr.includes(opt.value);
              return (
                <OptionRow key={opt.value} checked={checked}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      if (checked) onChange(arr.filter((v) => v !== opt.value));
                      else onChange([...arr, opt.value]);
                    }}
                    className="w-4 h-4 rounded accent-brand-600"
                  />
                  {opt.label?.[lang] || opt.label?.fa}
                </OptionRow>
              );
            })}
          </div>
        );
      case 'text':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="input-field"
            rows={3}
          />
        );
      case 'numeric':
        return (
          <input
            type="number"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
            className="input-field"
          />
        );
      case 'date':
        return (
          <div className="w-48">
            <PersianDatePicker value={value} onChange={onChange} className="input-field w-full" />
          </div>
        );
      case 'matrix':
        return (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="text-sm border-collapse w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th></th>
                  {question.options.map((col) => (
                    <th key={col.value} className="px-3 py-2 font-medium text-slate-500 text-xs">
                      {col.label?.[lang] || col.label?.fa}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {question.matrixRows.map((row, i) => {
                  const rowValue = (value && value[row.value]) || '';
                  return (
                    <tr key={row.value} className={i % 2 ? 'bg-slate-50/50' : ''}>
                      <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{row.label?.[lang] || row.label?.fa}</td>
                      {question.options.map((col) => (
                        <td key={col.value} className="px-3 py-2 text-center">
                          <input
                            type="radio"
                            name={`${question._id}_${row.value}`}
                            checked={rowValue === col.value}
                            onChange={() => onChange({ ...(value || {}), [row.value]: col.value })}
                            className="w-4 h-4 accent-brand-600"
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div className="mb-7">
      <label className="block text-[15px] font-medium text-slate-800 mb-3">
        {label}
        {question.required && <span className="text-red-500 ms-1">*</span>}
      </label>
      {renderInput()}
      {error && <p className="text-red-500 text-xs mt-2">⚠ {t('survey.take.requiredError')}</p>}
    </div>
  );
}
