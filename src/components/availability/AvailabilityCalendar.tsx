'use client';

import { useState, useMemo } from 'react';
import { format, addDays, startOfWeek, isSameDay, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AvailabilitySlotPublic } from '@/types/availability';

interface AvailabilityCalendarProps {
  slots: AvailabilitySlotPublic[];
  onSelectTime?: (time: Date) => void;
  selectedTimes?: Date[];
  mode?: 'view' | 'select';
  minDate?: Date;
}

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const START_HOUR = 7;
const END_HOUR = 21;

const HOURS = Array.from(
  { length: END_HOUR - START_HOUR },
  (_, i) => START_HOUR + i
);

export function AvailabilityCalendar({
  slots,
  onSelectTime,
  selectedTimes = [],
  mode = 'view',
  minDate = new Date(),
}: AvailabilityCalendarProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { locale: de, weekStartsOn: 1 })
  );

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i)),
    [currentWeekStart]
  );

  const goToPreviousWeek = () => {
    setCurrentWeekStart((prev) => addDays(prev, -7));
  };

  const goToNextWeek = () => {
    setCurrentWeekStart((prev) => addDays(prev, 7));
  };

  const goToToday = () => {
    setCurrentWeekStart(
      startOfWeek(new Date(), { locale: de, weekStartsOn: 1 })
    );
  };

  const hasAvailableSlots = slots.some(
    (slot) => slot.slot_type === 'available'
  );

  const getSlotForDateTime = (
    date: Date,
    hour: number
  ): AvailabilitySlotPublic | null => {
    const dayOfWeek = (date.getDay() + 6) % 7;

    const specificSlots = slots.filter((slot) => slot.specific_date);

    for (const slot of specificSlots) {
      if (!slot.specific_date || !slot.specific_start || !slot.specific_end)
        continue;

      try {
        const slotDate = parseISO(slot.specific_date);
        if (isSameDay(slotDate, date)) {
          const startDateTime = parseISO(slot.specific_start);
          const endDateTime = parseISO(slot.specific_end);

          const slotStartHour = startDateTime.getHours();
          const slotEndHour = endDateTime.getHours();

          if (hour >= slotStartHour && hour < slotEndHour) {
            return slot;
          }
        }
      } catch (e) {
        console.error('Failed to parse slot dates:', slot, e);
        continue;
      }
    }

    const recurringSlots = slots.filter(
      (slot) => slot.day_of_week !== null && slot.day_of_week !== undefined
    );
    for (const slot of recurringSlots) {
      if (slot.day_of_week === dayOfWeek && slot.start_time && slot.end_time) {
        const slotStart = parseInt(slot.start_time.split(':')[0] || '0');
        const slotEnd = parseInt(slot.end_time.split(':')[0] || '0');
        if (hour >= slotStart && hour < slotEnd) {
          return slot;
        }
      }
    }

    return null;
  };

  const handleTimeClick = (date: Date, hour: number) => {
    if (mode !== 'select' || !onSelectTime) return;

    const dateTime = new Date(date);
    dateTime.setHours(hour, 0, 0, 0);

    if (dateTime < minDate) return;

    const slot = getSlotForDateTime(date, hour);

    if (hasAvailableSlots) {
      if (slot && slot.slot_type === 'available') {
        onSelectTime(dateTime);
      }
    } else {
      if (!slot || slot.slot_type !== 'blocked') {
        onSelectTime(dateTime);
      }
    }
  };

  const isTimeSelected = (date: Date, hour: number): boolean => {
    if (!selectedTimes.length) return false;
    const dateTime = new Date(date);
    dateTime.setHours(hour, 0, 0, 0);
    return selectedTimes.some(
      (selectedTime) =>
        isSameDay(dateTime, selectedTime) &&
        dateTime.getHours() === selectedTime.getHours()
    );
  };

  const isTimePast = (date: Date, hour: number): boolean => {
    const dateTime = new Date(date);
    dateTime.setHours(hour, 59, 59, 999);
    return dateTime < minDate;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousWeek}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            <Calendar className="mr-2 h-4 w-4" />
            Heute
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextWeek}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {format(weekDays[0], 'dd.MM.', { locale: de })} -{' '}
          {format(weekDays[6], 'dd.MM.yyyy', { locale: de })}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="max-h-96 overflow-x-auto overflow-y-auto">
          <div className="min-w-[600px]">
            <div className="sticky top-0 z-10 grid grid-cols-8 border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
              <div className="sticky left-0 z-20 border-r border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800">
                <Clock className="mx-auto h-4 w-4 text-gray-400" />
              </div>
              {weekDays.map((day, idx) => (
                <div
                  key={idx}
                  className="border-r border-gray-200 p-2 text-center last:border-r-0 dark:border-gray-700"
                >
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {WEEKDAYS[idx]}
                  </div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {format(day, 'dd.MM', { locale: de })}
                  </div>
                </div>
              ))}
            </div>

            {HOURS.map((hour) => (
              <div
                key={hour}
                className="grid grid-cols-8 border-b border-gray-200 last:border-b-0 dark:border-gray-700"
              >
                <div className="sticky left-0 z-10 border-r border-gray-200 bg-gray-50 p-2 text-center text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                {weekDays.map((day, idx) => {
                  const slot = getSlotForDateTime(day, hour);
                  const isBlocked = slot?.slot_type === 'blocked';
                  const isAvailable = hasAvailableSlots
                    ? slot?.slot_type === 'available'
                    : !isBlocked;
                  const isSelected = isTimeSelected(day, hour);
                  const isPast = isTimePast(day, hour);
                  const isSelectable =
                    mode === 'select' && isAvailable && !isPast && !isBlocked;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleTimeClick(day, hour)}
                      disabled={!isSelectable}
                      className={`border-r border-gray-200 p-2 last:border-r-0 dark:border-gray-700 ${
                        isSelected
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : isAvailable && !isPast && !isBlocked
                            ? 'bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30'
                            : isBlocked
                              ? 'bg-red-50 dark:bg-red-900/20'
                              : isPast
                                ? 'bg-gray-200 dark:bg-gray-800'
                                : 'bg-white dark:bg-gray-900'
                      } ${isSelectable ? 'cursor-pointer' : 'cursor-not-allowed'} transition-colors`}
                    >
                      {(slot ||
                        (!hasAvailableSlots && !isPast && !isBlocked)) && (
                        <div className="flex h-full items-center justify-center">
                          {isSelected ? (
                            <div className="h-2 w-2 rounded-full bg-white" />
                          ) : isAvailable && !isPast && !isBlocked ? (
                            <div className="h-2 w-2 rounded-full bg-green-500 dark:bg-green-400" />
                          ) : isBlocked ? (
                            <div className="h-2 w-2 rounded-full bg-red-500 dark:bg-red-400" />
                          ) : null}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-green-500" />
          <span>Verfügbar</span>
        </div>
        {slots.some((s) => s.slot_type === 'blocked') && (
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <span>Blockiert</span>
          </div>
        )}
        {mode === 'select' && (
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <span>Ausgewählt</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-gray-200 dark:bg-gray-800" />
          <span>Vergangen</span>
        </div>
      </div>
    </div>
  );
}
