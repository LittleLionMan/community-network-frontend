import { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import { de } from 'date-fns/locale';
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
      <div className="relative w-full">
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
          className={`w-full rounded-md border ${
            error ? 'border-red-300' : 'border-gray-300'
          } bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-community-500 focus:outline-none focus:ring-2 focus:ring-community-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400`}
          wrapperClassName="w-full"
          calendarClassName="custom-datepicker-calendar"
          popperClassName="custom-datepicker-popper"
          showPopperArrow={false}
          popperPlacement="bottom-start"
        />
      </div>
    );
  }
);

DateTimePicker.displayName = 'DateTimePicker';
