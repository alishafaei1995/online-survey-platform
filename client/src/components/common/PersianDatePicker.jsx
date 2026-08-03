import * as DatePickerModule from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';

const DatePicker = DatePickerModule.default?.default ?? DatePickerModule.default;

export default function PersianDatePicker({ value, onChange, className }) {
  return (
    <DatePicker
      calendar={persian}
      locale={persian_fa}
      value={value ? new Date(value) : ''}
      onChange={(dateObject) => {
        if (!dateObject) {
          onChange('');
          return;
        }
        onChange(dateObject.toDate().toISOString().slice(0, 10));
      }}
      inputClass={className || 'border border-slate-300 rounded-md px-2 py-1 text-sm w-full'}
      calendarPosition="bottom-right"
      containerClassName="w-full"
    />
  );
}
