'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateThread, useCreatePost } from '@/hooks/useDiscussions';
import { FileText, Tag, MessageSquare, Save, X, RefreshCw } from 'lucide-react';
import type { ForumCategory } from '@/types/forum';
import { useState } from 'react';

const threadSchema = z.object({
  title: z
    .string()
    .min(3, 'Titel muss mindestens 3 Zeichen lang sein')
    .max(200, 'Titel darf maximal 200 Zeichen lang sein'),
  category_id: z.number().min(1, 'Bitte wähle eine Kategorie'),
  content: z
    .string()
    .min(10, 'Der erste Post muss mindestens 10 Zeichen lang sein')
    .max(5000, 'Der erste Post darf maximal 5000 Zeichen lang sein'),
});

type ThreadFormData = z.infer<typeof threadSchema>;

interface ThreadCreateFormProps {
  categories: ForumCategory[];
  defaultCategoryId?: number;
  onSuccess: (threadId: number) => void;
  onCancel: () => void;
}

export function ThreadCreateForm({
  categories,
  defaultCategoryId,
  onSuccess,
  onCancel,
}: ThreadCreateFormProps) {
  const [isCreating, setIsCreating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ThreadFormData>({
    resolver: zodResolver(threadSchema),
    defaultValues: {
      title: '',
      category_id: defaultCategoryId || undefined,
      content: '',
    },
  });

  const createThread = useCreateThread();
  const createPost = useCreatePost();

  const contentLength = watch('content')?.length || 0;

  const onSubmit = async (data: ThreadFormData) => {
    setIsCreating(true);
    try {
      const threadResult = await createThread.mutateAsync({
        title: data.title,
        category_id: data.category_id,
      });

      const threadId = (threadResult as { id: number }).id;

      await createPost.mutateAsync({
        threadId,
        content: data.content,
      });

      onSuccess(threadId);
    } catch (error) {
      // Error handled by hooks
      setIsCreating(false);
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
          placeholder="Gib deinem Thread einen aussagekräftigen Titel"
          error={!!errors.title}
          disabled={isCreating}
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
          {...register('category_id', {
            valueAsNumber: true,
            required: 'Bitte wähle eine Kategorie',
          })}
          className="bg-background flex h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-community-500 focus:outline-none focus:ring-2 focus:ring-community-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isCreating}
        >
          <option value="">Kategorie auswählen</option>
          {categories.map((category) => (
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

      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
          <MessageSquare className="h-4 w-4" />
          Erster Post *
        </label>
        <textarea
          {...register('content')}
          rows={8}
          className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-community-500 focus:outline-none focus:ring-2 focus:ring-community-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Starte die Diskussion... Was möchtest du besprechen?"
          disabled={isCreating}
        />
        <div className="mt-1 flex items-center justify-between">
          <p className="text-xs text-gray-500">{contentLength}/5000 Zeichen</p>
          {errors.content && (
            <p className="text-sm text-red-600">{errors.content.message}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row">
        <Button
          type="submit"
          disabled={isCreating}
          className="flex items-center gap-2"
        >
          {isCreating ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Thread wird erstellt...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Thread erstellen
            </>
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isCreating}
        >
          <X className="mr-2 h-4 w-4" />
          Abbrechen
        </Button>
      </div>
    </form>
  );
}
