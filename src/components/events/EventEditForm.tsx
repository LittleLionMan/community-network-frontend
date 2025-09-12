'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUpdateEvent } from '@/hooks/useEventMutations';
import { useEventCategories } from '@/hooks/useEvents';
import {
  eventCreateSchema,
  type EventFormData,
  formatDateTimeForInput,
  parseDateTimeFromInput,
} from '@/lib/validations/event';
import { toast } from '@/components/ui/toast';
import {
  CalendarDays,
  MapPin,
  Users,
  FileText,
  Tag,
  Clock,
  Save,
  RefreshCw,
  Trash2,
} from 'lucide-react';

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

interface EventEditFormProps {
  event: EventDetail;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EventEditForm({
  event,
  onSuccess,
  onCancel,
}: EventEditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateEventMutation = useUpdateEvent();
  const { data: categories, isLoading: categoriesLoading } =
    useEventCategories();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    reset,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventCreateSchema),
    defaultValues: {
      title: event.title,
      description: event.description,
      start_datetime: formatDateTimeForInput(new Date(event.start_datetime)),
      end_datetime: event.end_datetime
        ? formatDateTimeForInput(new Date(event.end_datetime))
        : '',
      location: event.location || '',
      max_participants: event.max_participants || undefined,
      category_id: event.category_id,
    },
  });

  const startDateTime = watch('start_datetime');

  const onSubmit = async (data: EventFormData) => {
    setIsSubmitting(true);

    try {
      const eventData = {
        title: data.title,
        description: data.description,
        start_datetime: parseDateTimeFromInput(data.start_datetime),
        end_datetime: data.end_datetime
          ? parseDateTimeFromInput(data.end_datetime)
          : undefined,
        location: data.location || undefined,
        max_participants: data.max_participants || undefined,
        category_id: data.category_id,
      };

      await updateEventMutation.mutateAsync({
        eventId: event.id,
        eventData,
      });

      toast.success(
        'Event aktualisiert!',
        'Die Änderungen wurden erfolgreich gespeichert.'
      );

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Update event error:', error);

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

  const hasParticipants = event.participant_count > 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
          <FileText className="h-4 w-4" />
          Titel *
        </label>
        <Input
          {...register('title')}
          placeholder="Gib deinem Event einen aussagekräftigen Titel"
          error={!!errors.title}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
          <Tag className="h-4 w-4" />
          Kategorie *
        </label>
        <select
          {...register('category_id', { valueAsNumber: true })}
          className="bg-background flex h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-community-500 focus:outline-none focus:ring-2 focus:ring-community-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Kategorie auswählen</option>
          {categories?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.category_id && (
          <p className="mt-1 text-sm text-red-600">
            {errors.category_id.message}
          </p>
        )}
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
            Ort (optional)
          </label>
          <Input
            {...register('location')}
            placeholder="Wo findet das Event statt?"
            error={!!errors.location}
          />
          {errors.location && (
            <p className="mt-1 text-sm text-red-600">
              {errors.location.message}
            </p>
          )}
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
          rows={6}
          className="bg-background flex w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-community-500 focus:outline-none focus:ring-2 focus:ring-community-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Beschreibe dein Event ausführlich. Was erwartet die Teilnehmer? Was sollen sie mitbringen? Gibt es besondere Hinweise?"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description.message}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Mindestens 10 Zeichen, maximal 2000 Zeichen
        </p>
      </div>

      <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:justify-between">
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={isSubmitting || categoriesLoading || !isDirty}
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
