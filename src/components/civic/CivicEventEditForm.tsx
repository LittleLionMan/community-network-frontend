'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUpdateEvent } from '@/hooks/useEventMutations';
import { toast } from '@/components/ui/toast';
import {
  CalendarDays,
  MapPin,
  Users,
  FileText,
  Clock,
  Save,
  RefreshCw,
  Trash2,
  Megaphone,
  AlertTriangle,
} from 'lucide-react';
import { Controller } from 'react-hook-form';
import { DateTimePicker } from '@/components/ui/DateTimePicker';

const parseDateTimeFromInput = (dateTimeString: string) => {
  return new Date(dateTimeString).toISOString();
};

const civicEventEditSchema = z.object({
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

type CivicEventEditFormData = z.infer<typeof civicEventEditSchema>;

interface EventDetail {
  id: number;
  title: string;
  description: string;
  start_datetime: string;
  end_datetime?: string;
  location?: string;
  max_participants?: number;
  category_id: number;
  is_active: boolean;
  participant_count: number;
}

interface CivicEventEditFormProps {
  event: EventDetail;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CivicEventEditForm({
  event,
  onSuccess,
  onCancel,
}: CivicEventEditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateEventMutation = useUpdateEvent();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
    watch,
    reset,
  } = useForm<CivicEventEditFormData>({
    resolver: zodResolver(civicEventEditSchema),
    defaultValues: {
      title: event.title,
      description: event.description,
      start_datetime: event.start_datetime,
      end_datetime: event.end_datetime || '',
      location: event.location || '',
      max_participants: event.max_participants || undefined,
    },
  });

  const hasParticipants = event.participant_count > 0;

  const onSubmit = async (data: CivicEventEditFormData) => {
    setIsSubmitting(true);

    try {
      const eventData = {
        title: data.title.trim(),
        description: data.description.trim(),
        start_datetime: parseDateTimeFromInput(data.start_datetime),
        end_datetime: data.end_datetime
          ? parseDateTimeFromInput(data.end_datetime)
          : undefined,
        location: data.location?.trim() || undefined,
        max_participants: data.max_participants || undefined,
        category_id: event.category_id,
      };

      await updateEventMutation.mutateAsync({
        eventId: event.id,
        eventData,
      });

      toast.success(
        'Politisches Event aktualisiert!',
        'Die Änderungen wurden erfolgreich gespeichert.'
      );

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Update civic event error:', error);

      if (error instanceof Error) {
        if (error.message.includes('400')) {
          toast.error('Ungültige Daten', 'Bitte überprüfe deine Eingaben.');
        } else if (error.message.includes('401')) {
          toast.error(
            'Nicht berechtigt',
            'Du bist nicht berechtigt, dieses Event zu bearbeiten.'
          );
        } else if (error.message.includes('403')) {
          toast.error(
            'Aktion nicht erlaubt',
            'Das Event kann nicht mehr bearbeitet werden.'
          );
        } else {
          toast.error(
            'Fehler beim Speichern',
            'Bitte versuche es später erneut.'
          );
        }
      } else {
        toast.error(
          'Fehler beim Speichern',
          'Bitte versuche es später erneut.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    reset();
    toast.success('Zurückgesetzt', 'Alle Änderungen wurden verworfen.');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <Megaphone className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
          <div>
            <h3 className="font-medium text-blue-900">
              Politisches Event bearbeiten
            </h3>
            <p className="mt-1 text-sm text-blue-800">
              Du bearbeitest ein Event mit politischem oder gesellschaftlichem
              Fokus. Bitte achte weiterhin auf eine sachliche, respektvolle
              Beschreibung.
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
          <Controller
            name="start_datetime"
            control={control}
            render={({ field }) => (
              <DateTimePicker
                value={field.value ? new Date(field.value) : undefined}
                onChange={(date) => field.onChange(date?.toISOString())}
                placeholder="TT.MM.JJJJ HH:MM"
                error={!!errors.start_datetime}
                minDate={new Date()}
              />
            )}
          />
          {errors.start_datetime && (
            <p className="mt-1 text-sm text-red-600">
              {errors.start_datetime.message}
            </p>
          )}
          {hasParticipants && (
            <p className="mt-1 text-xs text-yellow-600">
              ⚠️ Bei bereits angemeldeten Teilnehmern solltest du das Datum nur
              in Notfällen ändern.
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
            <Clock className="h-4 w-4" />
            Enddatum & Zeit (optional)
          </label>
          <Controller
            name="end_datetime"
            control={control}
            render={({ field }) => (
              <DateTimePicker
                value={field.value ? new Date(field.value) : undefined}
                onChange={(date) => field.onChange(date?.toISOString())}
                placeholder="TT.MM.JJJJ HH:MM (optional)"
                error={!!errors.end_datetime}
                minDate={
                  watch('start_datetime')
                    ? new Date(watch('start_datetime'))
                    : new Date()
                }
              />
            )}
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
            min={event.participant_count || 1}
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
            placeholder="Unbegrenzt"
            error={!!errors.max_participants}
          />
          {errors.max_participants && (
            <p className="mt-1 text-sm text-red-600">
              {errors.max_participants.message}
            </p>
          )}
          {hasParticipants && (
            <p className="mt-1 text-xs text-gray-500">
              Minimum: {event.participant_count} (bereits angemeldet)
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
              <li>• Bei größeren Änderungen Teilnehmer vorab informieren</li>
              <li>• Eventuelle rechtliche Bestimmungen beachten</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:justify-between">
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Speichern...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Änderungen speichern
              </>
            )}
          </Button>

          {isDirty && (
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Zurücksetzen
            </Button>
          )}
        </div>

        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Abbrechen
          </Button>
        )}
      </div>

      {!isDirty && (
        <div className="rounded-lg bg-blue-50 p-4">
          <p className="text-sm text-blue-700">
            ✓ Alle Änderungen wurden gespeichert. Du kannst weitere Anpassungen
            vornehmen oder zur Event-Ansicht zurückkehren.
          </p>
        </div>
      )}
    </form>
  );
}
