import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { parseISO, subHours, format, isPast } from 'date-fns';
import { de } from 'date-fns/locale';

const REGISTRATION_DEADLINE_HOURS = 24;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRegistrationDeadline(startDateTime: string): Date {
  const eventStart = parseISO(startDateTime);
  return subHours(eventStart, REGISTRATION_DEADLINE_HOURS);
}

export function isRegistrationDeadlinePassed(startDateTime: string): boolean {
  const deadline = getRegistrationDeadline(startDateTime);
  return isPast(deadline);
}

export function formatRegistrationDeadline(startDateTime: string): string {
  const deadline = getRegistrationDeadline(startDateTime);
  return format(deadline, 'dd.MM.yyyy, HH:mm', { locale: de });
}

export function getRegistrationDeadlineText(startDateTime: string): string {
  const deadline = getRegistrationDeadline(startDateTime);
  const eventStart = parseISO(startDateTime);

  const eventText = format(eventStart, 'dd.MM.yyyy, HH:mm', { locale: de });
  const deadlineText = format(deadline, 'dd.MM.yyyy, HH:mm', { locale: de });

  return `Anmeldung bis ${deadlineText} Uhr möglich`;
}
