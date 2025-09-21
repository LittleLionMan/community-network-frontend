'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateCivicEvent } from '@/hooks/useEvents';
import { toast } from '@/components/ui/toast';
import {
  CalendarDays,
  MapPin,
  Users,
  FileText,
  Clock,
  Save,
  RefreshCw,
  Megaphone,
  AlertTriangle,
} from 'lucide-react';

const formatDateTimeForInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const parseDateTimeFromInput = (dateTimeString: string) => {
  return new Date(dateTimeString).toISOString();
};

const civicEventSchema = z.object({
  title: z.string().min(1, 'Titel ist erforderlich').max(200, 'Titel zu lang'),
  description: z
    .string()
    .min(10, 'Beschreibung zu kurz')
    .max(2000, 'Beschreibung zu lang'),
  start_datetime: z.string().min(1, 'Startdatum ist erforderlich'),
  end_datetime: z.string().optional(),
  location: z.string().optional(),
  max_participants: z.number().min(1).max(1000).optional(),
});

type CivicEventFormData = z.infer<typeof civicEventSchema>;

interface CivicEventCreateFormProps {
  onSuccess?: (eventId: number) => void;
  onCancel?: () => void;
}

export function CivicEventCreateForm({
  onSuccess,
  onCancel,
}: CivicEventCreateFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createEventMutation = useCreateCivicEvent();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<CivicEventFormData>({
    resolver: zodResolver(civicEventSchema),
    defaultValues: {
      title: '',
      description: '',
      start_datetime: formatDateTimeForInput(
        new Date(Date.now() + 24 * 60 * 60 * 1000)
      ),
      end_datetime: '',
      location: '',
      max_participants: undefined,
    },
  });

  const startDateTime = watch('start_datetime');

  const onSubmit = async (data: CivicEventFormData) => {
    setIsSubmitting(true);

    try {
      const cleanedData = {
        title: data.title.trim(),
        description: data.description.trim(),
        start_datetime: parseDateTimeFromInput(data.start_datetime),
        end_datetime:
          data.end_datetime && data.end_datetime.trim() !== ''
            ? parseDateTimeFromInput(data.end_datetime)
            : undefined,
        location:
          data.location && data.location.trim() !== ''
            ? data.location.trim()
            : undefined,
        max_participants:
          data.max_participants &&
          !isNaN(data.max_participants) &&
          data.max_participants > 0
            ? Number(data.max_participants)
            : undefined,
      };

      const result = (await createEventMutation.mutateAsync(cleanedData)) as {
        id: number;
      };

      toast.success(
        'Politisches Event erstellt!',
        'Dein politisches Event wurde erfolgreich erstellt.'
      );
      reset();

      if (onSuccess && result?.id) {
        onSuccess(result.id);
      }
    } catch (error) {
      console.error('Create civic event error:', error);

      if (error instanceof Error) {
        if (error.message.includes('400')) {
          toast.error('Ungültige Daten', 'Bitte überprüfe deine Eingaben.');
        } else if (error.message.includes('401')) {
          toast.error(
            'Nicht angemeldet',
            'Du musst angemeldet sein, um Events zu erstellen.'
          );
        } else {
          toast.error(
            'Fehler beim Erstellen',
            'Bitte versuche es später erneut.'
          );
        }
      } else {
        toast.error(
          'Fehler beim Erstellen',
          'Bitte versuche es später erneut.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <Megaphone className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
          <div>
            <h3 className="font-medium text-blue-900">
              Politisches Event erstellen
            </h3>
            <p className="mt-1 text-sm text-blue-800">
              Du erstellst ein Event mit politischem oder gesellschaftlichem
              Fokus. Bitte achte auf eine sachliche, respektvolle Beschreibung.
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
          <FileText className="h-4 w-4" />
          Titel *
        </label>
        <Input
          {...register('title')}
          placeholder="z.B. 'Diskussion: Klimawandel und lokale Maßnahmen'"
          error={!!errors.title}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Wähle einen neutralen, informativen Titel ohne Meinungsäußerung
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
            <CalendarDays className="h-4 w-4" />
            Startdatum & Zeit *
          </label>
          <Input
            type="datetime-local"
            {...register('start_datetime')}
            error={!!errors.start_datetime}
          />
          {errors.start_datetime && (
            <p className="mt-1 text-sm text-red-600">
              {errors.start_datetime.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
            <Clock className="h-4 w-4" />
            Enddatum & Zeit (optional)
          </label>
          <Input
            type="datetime-local"
            {...register('end_datetime')}
            min={startDateTime}
            error={!!errors.end_datetime}
          />
          {errors.end_datetime && (
            <p className="mt-1 text-sm text-red-600">
              {errors.end_datetime.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
            <MapPin className="h-4 w-4" />
            Ort *
          </label>
          <Input
            {...register('location')}
            placeholder="z.B. Rathaus, Bürgerzentrum, Online"
            error={!!errors.location}
          />
          {errors.location && (
            <p className="mt-1 text-sm text-red-600">
              {errors.location.message}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Wähle einen für alle zugänglichen Ort
          </p>
        </div>

        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
            <Users className="h-4 w-4" />
            Max. Teilnehmer (optional)
          </label>
          <Input
            type="number"
            min="1"
            max="1000"
            {...register('max_participants', {
              setValueAs: (value) => {
                if (value === '' || value === null || value === undefined) {
                  return undefined;
                }
                const num = Number(value);
                return isNaN(num) ? undefined : num;
              },
            })}
            error={!!errors.max_participants}
          />
          {errors.max_participants && (
            <p className="mt-1 text-sm text-red-600">
              {errors.max_participants.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
          <FileText className="h-4 w-4" />
          Beschreibung *
        </label>
        <textarea
          {...register('description')}
          rows={8}
          className="bg-background flex w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-community-500 focus:outline-none focus:ring-2 focus:ring-community-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Beschreibe dein politisches Event ausführlich:
- Welches Thema wird behandelt?
- Wer ist die Zielgruppe?
- Was ist das Ziel der Veranstaltung?
- Gibt es Sprecher oder Experten?
- Was sollen Teilnehmer mitbringen oder vorbereiten?"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description.message}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Mindestens 10 Zeichen, maximal 2000 Zeichen. Bleibe sachlich und
          neutral.
        </p>
      </div>

      <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-600" />
          <div>
            <h4 className="font-medium text-orange-900">
              Richtlinien für politische Events
            </h4>
            <ul className="mt-2 space-y-1 text-sm text-orange-800">
              <li>• Respektvoller, sachlicher Umgang miteinander</li>
              <li>• Keine Hassrede oder Diskriminierung</li>
              <li>• Demokratische Werte respektieren</li>
              <li>• Bei Demos: Separate Anmeldung bei Behörden erforderlich</li>
              <li>• Eventuelle rechtliche Bestimmungen beachten</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Event erstellen...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Politisches Event erstellen
            </>
          )}
        </Button>

        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Abbrechen
          </Button>
        )}
      </div>
    </form>
  );
}
