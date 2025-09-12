'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateEvent } from '@/hooks/useEventMutations';
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
} from 'lucide-react';

interface EventCreateFormProps {
  onSuccess?: (eventId: number) => void;
  onCancel?: () => void;
}

export function EventCreateForm({ onSuccess, onCancel }: EventCreateFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createEventMutation = useCreateEvent();
  const { data: categories, isLoading: categoriesLoading } =
    useEventCategories();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventCreateSchema),
    defaultValues: {
      title: '',
      description: '',
      start_datetime: formatDateTimeForInput(
        new Date(Date.now() + 24 * 60 * 60 * 1000)
      ),
      end_datetime: '',
      location: '',
      max_participants: undefined,
      category_id: undefined,
    },
  });

  const startDateTime = watch('start_datetime');

  const onSubmit = async (data: EventFormData) => {
    setIsSubmitting(true);

    try {
      const eventData = {
        ...data,
        start_datetime: parseDateTimeFromInput(data.start_datetime),
        end_datetime: data.end_datetime
          ? parseDateTimeFromInput(data.end_datetime)
          : undefined,
        max_participants: data.max_participants || undefined,
      };

      const result = (await createEventMutation.mutateAsync(eventData)) as {
        id: number;
      };

      toast.success(
        'Event erstellt!',
        'Dein Event wurde erfolgreich erstellt.'
      );
      reset();

      if (onSuccess && result?.id) {
        onSuccess(result.id);
      }
    } catch (error) {
      console.error('Create event error:', error);

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
            min="1"
            max="1000"
            {...register('max_participants', { valueAsNumber: true })}
            placeholder="Unbegrenzt"
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

      <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row">
        <Button
          type="submit"
          disabled={isSubmitting || categoriesLoading}
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
              Event erstellen
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
