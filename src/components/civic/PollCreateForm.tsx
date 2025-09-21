'use client';

import { useState } from 'react';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreatePoll } from '@/hooks/usePolls';
import { toast } from '@/components/ui/toast';
import {
  Plus,
  Trash2,
  Clock,
  Users,
  Save,
  RefreshCw,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';

const pollOptionSchema = z.object({
  text: z
    .string()
    .min(1, 'Option darf nicht leer sein')
    .max(200, 'Option zu lang'),
  order_index: z.number(),
});

const pollFormSchema = z.object({
  question: z
    .string()
    .min(1, 'Frage ist erforderlich')
    .max(500, 'Frage ist zu lang'),
  poll_type: z.enum(['admin', 'thread']),
  ends_at: z.string().optional(),
  thread_id: z.number().optional(),
  options: z
    .array(pollOptionSchema)
    .min(2, 'Mindestens 2 Optionen erforderlich')
    .max(10, 'Maximal 10 Optionen erlaubt'),
  auto_suggest_duration: z.boolean(),
});

type PollFormData = z.infer<typeof pollFormSchema>;

interface PollCreateFormProps {
  onSuccess?: (pollId: number) => void;
  onCancel?: () => void;
  defaultType?: 'admin' | 'thread';
  threadId?: number;
}

export function PollCreateForm({
  onSuccess,
  onCancel,
  defaultType = 'admin',
  threadId,
}: PollCreateFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createPollMutation = useCreatePoll();

  const form = useForm<PollFormData>({
    resolver: zodResolver(pollFormSchema),
    defaultValues: {
      question: '',
      poll_type: threadId ? 'thread' : defaultType,
      ends_at: '',
      thread_id: threadId,
      options: [
        { text: '', order_index: 0 },
        { text: '', order_index: 1 },
      ],
      auto_suggest_duration: true,
    },
    mode: 'onChange',
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options',
  });

  const pollType = watch('poll_type');
  const autoSuggestDuration = watch('auto_suggest_duration');

  const onSubmit: SubmitHandler<PollFormData> = async (data) => {
    setIsSubmitting(true);

    try {
      const cleanedOptions = data.options
        .filter((option) => option.text.trim() !== '')
        .map((option, index) => ({
          text: option.text.trim(),
          order_index: index,
        }));

      if (cleanedOptions.length < 2) {
        toast.error(
          'Ungültige Daten',
          'Mindestens 2 gültige Optionen erforderlich.'
        );
        setIsSubmitting(false);
        return;
      }

      const pollData = {
        question: data.question.trim(),
        poll_type: data.poll_type,
        ends_at:
          data.ends_at && data.ends_at.trim() !== ''
            ? new Date(data.ends_at).toISOString()
            : undefined,
        thread_id: data.poll_type === 'thread' ? data.thread_id : undefined,
        options: cleanedOptions,
      };

      const shouldAutoSuggest = data.auto_suggest_duration && !pollData.ends_at;

      const result = await createPollMutation.mutateAsync({
        data: pollData,
        autoSuggestDuration: shouldAutoSuggest,
      });

      toast.success(
        'Abstimmung erstellt!',
        'Deine Abstimmung wurde erfolgreich erstellt und ist jetzt aktiv.'
      );

      reset();

      if (onSuccess && result?.id) {
        onSuccess(result.id);
      }
    } catch (error) {
      console.error('Create poll error:', error);

      if (error instanceof Error) {
        if (error.message.includes('400')) {
          toast.error('Ungültige Daten', 'Bitte überprüfe deine Eingaben.');
        } else if (error.message.includes('401')) {
          toast.error(
            'Nicht angemeldet',
            'Du musst angemeldet sein, um Abstimmungen zu erstellen.'
          );
        } else if (error.message.includes('403')) {
          toast.error(
            'Keine Berechtigung',
            'Du bist nicht berechtigt, diese Art von Abstimmung zu erstellen.'
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

  const addOption = () => {
    if (fields.length < 10) {
      append({ text: '', order_index: fields.length });
    }
  };

  const removeOption = (index: number) => {
    if (fields.length > 2) {
      remove(index);
    }
  };

  const formatDateTimeForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const getMinDateTime = () => {
    return formatDateTimeForInput(new Date());
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {!threadId && (
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
            <Users className="h-4 w-4" />
            Abstimmungstyp *
          </label>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="relative">
              <input
                type="radio"
                value="admin"
                {...register('poll_type')}
                className="peer sr-only"
              />
              <div className="cursor-pointer rounded-lg border-2 border-gray-200 p-4 transition-all peer-checked:border-blue-500 peer-checked:bg-blue-50">
                <div className="font-medium text-gray-900">
                  🏛️ Admin-Community-Abstimmung
                </div>
                <div className="text-sm text-gray-600">
                  Nur für Administratoren • Wichtige Community-Entscheidungen
                  mit Benachrichtigungen
                </div>
              </div>
            </label>

            <label className="relative">
              <input
                type="radio"
                value="thread"
                {...register('poll_type')}
                className="peer sr-only"
                disabled={!!threadId}
              />
              <div className="cursor-pointer rounded-lg border-2 border-gray-200 p-4 transition-all peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                <div className="font-medium text-gray-900">
                  💬 Diskussions-Poll
                </div>
                <div className="text-sm text-gray-600">
                  Für alle User • Meinungsbilder und Diskussionsunterstützung
                </div>
              </div>
            </label>
          </div>
          {errors.poll_type && (
            <p className="mt-1 text-sm text-red-600">
              {errors.poll_type.message}
            </p>
          )}
        </div>
      )}

      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
          <HelpCircle className="h-4 w-4" />
          Frage *
        </label>
        <textarea
          {...register('question')}
          rows={3}
          className="bg-background flex w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-community-500 focus:outline-none focus:ring-2 focus:ring-community-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Stelle eine klare und präzise Frage für deine Abstimmung..."
        />
        {errors.question && (
          <p className="mt-1 text-sm text-red-600">{errors.question.message}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">Maximal 500 Zeichen</p>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Users className="h-4 w-4" />
            Antwortoptionen *
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addOption}
            disabled={fields.length >= 10}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Option hinzufügen
          </Button>
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-3">
              <div className="flex-shrink-0 text-sm font-medium text-gray-500">
                {index + 1}.
              </div>
              <Input
                {...register(`options.${index}.text`)}
                placeholder={`Option ${index + 1}`}
                error={!!errors.options?.[index]?.text}
                className="flex-1"
              />
              {fields.length > 2 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeOption(index)}
                  className="flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {errors.options && (
          <p className="mt-1 text-sm text-red-600">
            {typeof errors.options.message === 'string'
              ? errors.options.message
              : 'Bitte überprüfe die Optionen'}
          </p>
        )}

        <div className="mt-2 text-xs text-gray-500">
          Mindestens 2, maximal 10 Optionen. Jede Option maximal 200 Zeichen.
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Clock className="h-4 w-4" />
            Enddatum (optional)
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              {...register('auto_suggest_duration')}
              className="rounded border-gray-300 text-community-600 focus:ring-community-500"
            />
            <span className="text-gray-600">Automatisch vorschlagen</span>
          </label>
        </div>

        <Input
          type="datetime-local"
          {...register('ends_at')}
          min={getMinDateTime()}
          error={!!errors.ends_at}
          disabled={autoSuggestDuration}
        />

        {autoSuggestDuration && (
          <p className="mt-1 text-xs text-blue-600">
            Vorgeschlagen: {pollType === 'admin' ? '7 Tage' : '2 Tage'} ab jetzt
          </p>
        )}

        {errors.ends_at && (
          <p className="mt-1 text-sm text-red-600">{errors.ends_at.message}</p>
        )}

        <p className="mt-1 text-xs text-gray-500">
          Leer lassen für unbegrenzte Laufzeit oder automatischen Vorschlag
          verwenden
        </p>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
          <div>
            <h4 className="font-medium text-blue-900">
              Hinweise zur Abstimmung
            </h4>
            <ul className="mt-2 space-y-1 text-sm text-blue-800">
              <li>
                • Nutzer können ihre Stimme bis zum Ende der Abstimmung ändern
              </li>
              <li>
                • Alle Abstimmungen sind transparent und öffentlich einsehbar
              </li>
              <li>
                •{' '}
                {pollType === 'admin'
                  ? 'Admin-Abstimmungen benachrichtigen alle Community-Mitglieder'
                  : 'Diskussions-Polls unterstützen Meinungsbildung und Entscheidungsfindung'}
              </li>
              <li>• Du kannst die Abstimmung jederzeit beenden oder löschen</li>
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
              Abstimmung erstellen...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Abstimmung erstellen
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
