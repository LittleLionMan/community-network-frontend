'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Save, RefreshCw, HelpCircle, Vote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreatePoll } from '@/hooks/usePolls';
import { toast } from '@/components/ui/toast';
import { DateTimePicker } from '@/components/ui/DateTimePicker';
import { Controller } from 'react-hook-form';

const pollSchema = z.object({
  question: z
    .string()
    .min(10, 'Frage muss mindestens 10 Zeichen lang sein')
    .max(500, 'Frage darf maximal 500 Zeichen lang sein'),
  poll_type: z.enum(['admin', 'thread']),
  options: z
    .array(
      z.object({
        text: z
          .string()
          .min(1, 'Option darf nicht leer sein')
          .max(200, 'Option darf maximal 200 Zeichen lang sein'),
      })
    )
    .min(2, 'Mindestens 2 Optionen erforderlich')
    .max(10, 'Maximal 10 Optionen erlaubt'),
  ends_at: z.string().optional(),
  auto_suggest_end: z.boolean().optional(),
});

type PollFormData = z.infer<typeof pollSchema>;

interface PollCreateFormProps {
  onSuccess?: (pollId: number) => void;
  onCancel?: () => void;
}

export function PollCreateForm({ onSuccess, onCancel }: PollCreateFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createPollMutation = useCreatePoll();

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PollFormData>({
    resolver: zodResolver(pollSchema),
    defaultValues: {
      question: '',
      poll_type: 'thread',
      options: [{ text: '' }, { text: '' }],
      ends_at: '',
      auto_suggest_end: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options',
  });

  const selectedPollType = watch('poll_type');
  const autoSuggestEnd = watch('auto_suggest_end');

  const onSubmit = async (data: PollFormData) => {
    setIsSubmitting(true);

    try {
      const pollData = {
        question: data.question.trim(),
        poll_type: data.poll_type,
        options: data.options.map((opt, index) => ({
          text: opt.text.trim(),
          order_index: index,
        })),
        ends_at:
          data.ends_at && data.ends_at.trim() !== ''
            ? new Date(data.ends_at).toISOString()
            : undefined,
      };

      const result = await createPollMutation.mutateAsync({
        data: pollData,
        autoSuggestDuration: data.auto_suggest_end,
      });

      toast.success(
        'Abstimmung erstellt!',
        'Deine Abstimmung wurde erfolgreich erstellt.'
      );

      if (onSuccess) {
        onSuccess(result.id);
      }
    } catch (error) {
      console.error('Create poll error:', error);
      toast.error(
        'Fehler beim Erstellen',
        'Die Abstimmung konnte nicht erstellt werden.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const pollTypeOptions = [
    {
      value: 'admin' as const,
      label: 'Admin-Community-Abstimmung',
      description:
        'Nur für Administratoren • Wichtige Community-Entscheidungen mit Benachrichtigungen',
      icon: '🏛️',
    },
    {
      value: 'thread' as const,
      label: 'Diskussions-Poll',
      description:
        'Für alle User • Meinungsbilder und Diskussionsunterstützung',
      icon: '💬',
    },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div>
        <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Abstimmungstyp *
        </label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {pollTypeOptions.map((option) => {
            const isSelected = selectedPollType === option.value;
            return (
              <label
                key={option.value}
                className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 dark:border-blue-600 dark:bg-blue-950'
                    : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600'
                }`}
              >
                <input
                  type="radio"
                  value={option.value}
                  {...register('poll_type')}
                  className="sr-only"
                />
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{option.icon}</span>
                  <div className="flex-1">
                    <div
                      className={`mb-1 font-semibold ${
                        isSelected
                          ? 'text-blue-900 dark:text-blue-100'
                          : 'text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      {option.label}
                    </div>
                    <p
                      className={`text-sm ${
                        isSelected
                          ? 'text-blue-700 dark:text-blue-300'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {option.description}
                    </p>
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <Vote className="h-4 w-4" />
          Frage *
        </label>
        <textarea
          {...register('question')}
          rows={4}
          style={{
            backgroundColor: 'var(--background)',
            color: 'var(--foreground)',
          }}
          className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600"
          placeholder="z.B. 'Welches Thema soll beim nächsten Community-Event behandelt werden?'"
        />
        {errors.question && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.question.message}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Maximal 500 Zeichen
        </p>
      </div>

      <div>
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <HelpCircle className="h-4 w-4" />
            Antwortoptionen *
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ text: '' })}
            disabled={fields.length >= 10}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Option hinzufügen</span>
            <span className="sm:hidden">Hinzufügen</span>
          </Button>
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {index + 1}.
                  </span>
                  <Input
                    {...register(`options.${index}.text`)}
                    placeholder={`Option ${index + 1}`}
                    error={!!errors.options?.[index]?.text}
                  />
                </div>
                {errors.options?.[index]?.text && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.options[index]?.text?.message}
                  </p>
                )}
              </div>
              {fields.length > 2 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => remove(index)}
                  className="flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {errors.options && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {errors.options.message}
          </p>
        )}

        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Mindestens 2, maximal 10 Optionen. Jede Option maximal 200 Zeichen.
        </p>
      </div>

      <div>
        <label className="mb-2 flex items-center gap-2">
          <input
            type="checkbox"
            {...register('auto_suggest_end')}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Automatisch vorschlagen
          </span>
        </label>

        {!autoSuggestEnd && (
          <div className="mt-3">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Enddatum (optional)
            </label>
            <Controller
              name="ends_at"
              control={control}
              render={({ field }) => (
                <DateTimePicker
                  value={field.value ? new Date(field.value) : undefined}
                  onChange={(date) => field.onChange(date?.toISOString())}
                  placeholder="TT.MM.JJJJ HH:MM (optional)"
                  error={!!errors.ends_at}
                  minDate={new Date()}
                />
              )}
            />
            {errors.ends_at && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.ends_at.message}
              </p>
            )}
            <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
              Vorgeschlagen: 2 Tage ab jetzt
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Leer lassen für unbegrenzte Laufzeit oder der automatischen
              Vorschlagsfunktion verwenden
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Erstellen...
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
