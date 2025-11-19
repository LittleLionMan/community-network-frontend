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
import { Controller } from 'react-hook-form';
import { DateTimePicker } from '@/components/ui/DateTimePicker';

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
    control,
    formState: { errors, isDirty },
    watch,
    reset,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventCreateSchema),
    defaultValues: {
      title: event.title,
      description: event.description,
      start_datetime: event.start_datetime,
      end_datetime: event.end_datetime || '',
      location: event.location || '',
      max_participants: event.max_participants || undefined,
      category_id: event.category_id,
    },
  });

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
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <FileText className="h-4 w-4" />
          Titel *
        </label>
        <Input
          {...register('title')}
          placeholder="Gib deinem Event einen aussagekräftigen Titel"
          error={!!errors.title}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.title.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <Tag className="h-4 w-4" />
          Kategorie *
        </label>
        <select
          {...register('category_id', { valueAsNumber: true })}
          className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-community-500 focus:outline-none focus:ring-2 focus:ring-community-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        >
          <option value="">Kategorie auswählen</option>
          {categories?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.category_id && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.category_id.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
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
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.start_datetime.message}
            </p>
          )}
          {hasParticipants && (
            <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
              ⚠️ Bei bereits angemeldeten Teilnehmern solltest du das Datum nur
              in Notfällen ändern.
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
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
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.end_datetime.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <MapPin className="h-4 w-4" />
            Ort (optional)
          </label>
          <Input
            {...register('location')}
            placeholder="Wo findet das Event statt?"
            error={!!errors.location}
          />
          {errors.location && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.location.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
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
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.max_participants.message}
            </p>
          )}
          {hasParticipants && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Minimum: {event.participant_count} (bereits angemeldet)
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <FileText className="h-4 w-4" />
          Beschreibung *
        </label>
        <textarea
          {...register('description')}
          rows={6}
          className="flex w-full resize-none rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-community-500 focus:outline-none focus:ring-2 focus:ring-community-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400"
          placeholder="Beschreibe dein Event ausführlich. Was erwartet die Teilnehmer? Was sollen sie mitbringen? Gibt es besondere Hinweise?"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.description.message}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Mindestens 10 Zeichen, maximal 2000 Zeichen
        </p>
      </div>

      <div className="flex flex-col gap-3 border-t pt-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="submit"
            disabled={isSubmitting || categoriesLoading || !isDirty}
            className="flex w-full items-center justify-center gap-2 sm:w-auto"
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
              className="flex w-full items-center justify-center gap-2 sm:w-auto"
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
            className="w-full sm:w-auto"
          >
            Abbrechen
          </Button>
        )}
      </div>

      {!isDirty && (
        <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            ✓ Alle Änderungen wurden gespeichert. Du kannst weitere Anpassungen
            vornehmen oder zur Event-Ansicht zurückkehren.
          </p>
        </div>
      )}
    </form>
  );
}
