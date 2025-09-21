import { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import { de } from 'date-fns/locale';
import { Calendar } from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';

interface DateTimePickerProps {
  value?: Date;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  error?: boolean;
  minDate?: Date;
  disabled?: boolean;
}

export const DateTimePicker = forwardRef<DatePicker, DateTimePickerProps>(
  (
    {
      value,
      onChange,
      placeholder = 'TT.MM.JJJJ HH:MM',
      error,
      minDate,
      disabled,
    },
    ref
  ) => {
    return (
      <div className="relative">
        <DatePicker
          ref={ref}
          selected={value}
          onChange={onChange}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          dateFormat="dd.MM.yyyy HH:mm"
          locale={de}
          placeholderText={placeholder}
          minDate={minDate}
          disabled={disabled}
          className={`w-full rounded-md border px-3 py-2 pr-10 ${
            error ? 'border-red-300' : 'border-gray-300'
          } focus:border-community-500 focus:outline-none focus:ring-2 focus:ring-community-500`}
        />
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          <Calendar className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    );
  }
);

DateTimePicker.displayName = 'DateTimePicker';
