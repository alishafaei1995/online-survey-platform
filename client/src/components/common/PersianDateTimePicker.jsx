import * as DatePickerModule from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import * as TimePickerModule from 'react-multi-date-picker/plugins/time_picker';

const DatePicker = DatePickerModule.default?.default ?? DatePickerModule.default;
const TimePicker = TimePickerModule.default?.default ?? TimePickerModule.default;

export default function PersianDateTimePicker({ value, onChange, className }) {
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
        onChange(dateObject.toDate().toISOString());
      }}
      format="YYYY/MM/DD HH:mm"
      plugins={[<TimePicker key="time" position="bottom" />]}
      inputClass={className || 'border border-slate-300 rounded-md px-2 py-1.5 text-sm w-full'}
      calendarPosition="bottom-right"
      containerClassName="w-full"
    />
  );
}
