import { z } from 'zod';

export const eventCreateSchema = z
  .object({
    title: z
      .string()
      .min(1, 'Titel ist erforderlich')
      .max(200, 'Titel darf maximal 200 Zeichen lang sein'),

    description: z
      .string()
      .min(10, 'Beschreibung muss mindestens 10 Zeichen lang sein')
      .max(2000, 'Beschreibung darf maximal 2000 Zeichen lang sein'),

    start_datetime: z.string().refine((date) => {
      const startDate = new Date(date);
      const now = new Date();
      return startDate > now;
    }, 'Startdatum muss in der Zukunft liegen'),

    end_datetime: z.string().optional(),

    location: z
      .string()
      .max(300, 'Ort darf maximal 300 Zeichen lang sein')
      .optional(),

    max_participants: z
      .number()
      .min(1, 'Mindestens 1 Teilnehmer erforderlich')
      .max(1000, 'Maximal 1000 Teilnehmer erlaubt')
      .optional(),

    category_id: z.number().min(1, 'Kategorie ist erforderlich'),
  })
  .refine(
    (data) => {
      if (!data.end_datetime) return true;

      const startDate = new Date(data.start_datetime);
      const endDate = new Date(data.end_datetime);

      return endDate > startDate;
    },
    {
      message: 'Enddatum muss nach dem Startdatum liegen',
      path: ['end_datetime'],
    }
  );

export type EventFormData = z.infer<typeof eventCreateSchema>;

export const formatDateTimeForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const parseDateTimeFromInput = (input: string): string => {
  return new Date(input).toISOString();
};
