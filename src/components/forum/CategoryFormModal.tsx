'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Save, RefreshCw } from 'lucide-react';
import {
  useCreateCategory,
  useUpdateCategory,
} from '@/hooks/useForumCategories';
import { DynamicIcon } from '@/lib/forum-utils';
import type { ForumCategory } from '@/types/forum';

const categorySchema = z.object({
  name: z
    .string()
    .min(1, 'Name erforderlich')
    .max(100, 'Name zu lang (max. 100 Zeichen)'),
  description: z
    .string()
    .max(500, 'Beschreibung zu lang (max. 500 Zeichen)')
    .optional()
    .or(z.literal('')),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Ungültige Hex-Farbe (z.B. #3B82F6)')
    .optional()
    .or(z.literal('')),
  icon: z.string().max(50, 'Icon-Name zu lang').optional().or(z.literal('')),
  display_order: z.number().int().min(0),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormModalProps {
  mode: 'create' | 'edit';
  category?: ForumCategory;
  onClose: () => void;
}

const FORUM_ICONS = [
  'MessageSquare',
  'Folder',
  'Users',
  'Lightbulb',
  'Settings',
  'HelpCircle',
  'Bell',
  'Trophy',
  'Zap',
] as const;

export function CategoryFormModal({
  mode,
  category,
  onClose,
}: CategoryFormModalProps) {
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues:
      mode === 'edit' && category
        ? {
            name: category.name,
            description: category.description || '',
            color: category.color || '#3B82F6',
            icon: category.icon || 'MessageSquare',
            display_order: category.display_order,
          }
        : {
            name: '',
            description: '',
            color: '#3B82F6',
            icon: 'MessageSquare',
            display_order: 0,
          },
  });

  const selectedIcon = watch('icon');
  const selectedColor = watch('color');

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (mode === 'create') {
        await createCategory.mutateAsync(data);
      } else if (category) {
        await updateCategory.mutateAsync({
          categoryId: category.id,
          data,
        });
      }
      onClose();
    } catch (error) {
      // Error handled by hooks
    }
  };

  const isPending = createCategory.isPending || updateCategory.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'create' ? 'Neue Kategorie' : 'Kategorie bearbeiten'}
          </h2>
          <button
            onClick={onClose}
            disabled={isPending}
            className="rounded-md p-1 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Name *
            </label>
            <Input
              {...register('name')}
              placeholder="z.B. Plattform-Features"
              error={!!errors.name}
              disabled={isPending}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Beschreibung
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-community-500 focus:outline-none focus:ring-2 focus:ring-community-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Kurze Beschreibung der Kategorie..."
              disabled={isPending}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Icon
            </label>
            <div className="grid grid-cols-5 gap-2">
              {FORUM_ICONS.map((iconName) => (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setValue('icon', iconName)}
                  disabled={isPending}
                  className={`flex h-12 items-center justify-center rounded-md border-2 transition-all ${
                    selectedIcon === iconName
                      ? 'border-community-500 bg-community-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{
                    backgroundColor:
                      selectedIcon === iconName
                        ? selectedColor || '#3B82F6' + '20'
                        : undefined,
                  }}
                >
                  <DynamicIcon
                    name={iconName}
                    className="h-6 w-6 text-gray-700"
                  />
                </button>
              ))}
            </div>
            {errors.icon && (
              <p className="mt-1 text-sm text-red-600">{errors.icon.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Farbe
            </label>
            <div className="flex gap-2">
              <Input
                {...register('color')}
                placeholder="#3B82F6"
                error={!!errors.color}
                disabled={isPending}
                className="flex-1"
              />
              <input
                type="color"
                value={selectedColor || '#3B82F6'}
                onChange={(e) => setValue('color', e.target.value)}
                className="h-10 w-16 cursor-pointer rounded border border-gray-300"
                disabled={isPending}
              />
            </div>
            {errors.color && (
              <p className="mt-1 text-sm text-red-600">
                {errors.color.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Vorschau
            </label>
            <div className="flex items-center gap-3 rounded-md border border-gray-200 bg-gray-50 p-4">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-lg"
                style={{ backgroundColor: selectedColor || '#3B82F6' }}
              >
                <DynamicIcon
                  name={selectedIcon}
                  className="h-6 w-6 text-white"
                />
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {watch('name') || 'Kategorie-Name'}
                </div>
                <div className="text-sm text-gray-600">
                  {watch('description') || 'Beschreibung...'}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Reihenfolge
            </label>
            <Input
              type="number"
              {...register('display_order', { valueAsNumber: true })}
              min="0"
              error={!!errors.display_order}
              disabled={isPending}
            />
            {errors.display_order && (
              <p className="mt-1 text-sm text-red-600">
                {errors.display_order.message}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Kleinere Zahlen werden zuerst angezeigt
            </p>
          </div>

          <div className="flex justify-end gap-3 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Speichern...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {mode === 'create' ? 'Erstellen' : 'Speichern'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
