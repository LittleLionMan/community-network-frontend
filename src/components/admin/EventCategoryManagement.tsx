'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Zap,
  XCircle,
} from 'lucide-react';
import { toast } from '@/components/ui/toast';
import {
  useAdminEventCategories,
  useCreateEventCategory,
  useUpdateEventCategory,
  useDeleteEventCategory,
  useCreateDefaultCategories,
} from '@/hooks/useEvents';

interface EventCategoryWithStats {
  id: number;
  name: string;
  description?: string;
  event_count: number;
  created_at: string;
  can_delete: boolean;
}

interface CategoryFormData {
  name: string;
  description: string;
}

interface CategoryModalProps {
  isOpen: boolean;
  category: EventCategoryWithStats | null;
  onClose: () => void;
  onSave: (data: CategoryFormData) => void;
  isLoading: boolean;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  category,
  onClose,
  onSave,
  isLoading,
}) => {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
  });
  const [errors, setErrors] = useState<Partial<CategoryFormData>>({});

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || '',
      });
    } else {
      setFormData({ name: '', description: '' });
    }
    setErrors({});
  }, [category, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Partial<CategoryFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name ist erforderlich';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name darf maximal 100 Zeichen lang sein';
    }

    if (formData.description.length > 500) {
      newErrors.description = 'Beschreibung darf maximal 500 Zeichen lang sein';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {category ? 'Kategorie bearbeiten' : 'Neue Kategorie erstellen'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                errors.name
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-indigo-500'
              }`}
              placeholder="z.B. Sport, Kultur, Bildung"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Beschreibung (optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className={`w-full resize-none rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                errors.description
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-indigo-500'
              }`}
              placeholder="Kurze Beschreibung der Kategorie"
              disabled={isLoading}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              disabled={isLoading}
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-1 h-4 w-4 animate-spin" />
                  Speichern...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-1 h-4 w-4" />
                  {category ? 'Aktualisieren' : 'Erstellen'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface DeleteConfirmationProps {
  isOpen: boolean;
  category: EventCategoryWithStats | null;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  isOpen,
  category,
  onClose,
  onConfirm,
  isLoading,
}) => {
  if (!isOpen || !category) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
        </div>

        <div className="text-center">
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            Kategorie löschen
          </h3>
          <p className="mb-4 text-sm text-gray-600">
            Möchtest du die Kategorie <strong>{category.name}</strong> wirklich
            löschen?
          </p>

          {!category.can_delete && (
            <div className="mb-4 rounded-md border border-yellow-200 bg-yellow-50 p-3">
              <p className="text-sm text-yellow-800">
                <strong>Achtung:</strong> Diese Kategorie wird von{' '}
                {category.event_count} Event(s) verwendet und kann nicht
                gelöscht werden.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-center space-x-3">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            disabled={isLoading}
          >
            Abbrechen
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading || !category.can_delete}
            className="flex items-center rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-1 h-4 w-4 animate-spin" />
                Löschen...
              </>
            ) : (
              <>
                <Trash2 className="mr-1 h-4 w-4" />
                Löschen
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export function EventCategoryManagement() {
  const {
    data: categories = [],
    isLoading,
    refetch,
  } = useAdminEventCategories();

  const createCategoryMutation = useCreateEventCategory();
  const updateCategoryMutation = useUpdateEventCategory();
  const deleteCategoryMutation = useDeleteEventCategory();
  const createDefaultsMutation = useCreateDefaultCategories();

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<EventCategoryWithStats | null>(null);

  const handleCreateDefaults = async () => {
    try {
      const response = await createDefaultsMutation.mutateAsync();
      toast.success('Standard-Kategorien erstellt', response.message);
    } catch (error) {
      toast.error('Fehler beim Erstellen der Standard-Kategorien');
      console.log(error);
    }
  };

  const handleSaveCategory = async (data: CategoryFormData) => {
    try {
      if (selectedCategory) {
        await updateCategoryMutation.mutateAsync({
          id: selectedCategory.id,
          data,
        });
        toast.success('Kategorie aktualisiert');
      } else {
        await createCategoryMutation.mutateAsync(data);
        toast.success('Kategorie erstellt');
      }
      setShowModal(false);
      setSelectedCategory(null);
    } catch (error) {
      toast.error(
        selectedCategory
          ? 'Fehler beim Aktualisieren der Kategorie'
          : 'Fehler beim Erstellen der Kategorie'
      );
      console.log(error);
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;

    try {
      await deleteCategoryMutation.mutateAsync(selectedCategory.id);
      toast.success('Kategorie gelöscht');
      setShowDeleteModal(false);
      setSelectedCategory(null);
    } catch (error) {
      toast.error('Fehler beim Löschen der Kategorie');
      console.log(error);
    }
  };

  const handleRefresh = async () => {
    await refetch();
    setLastUpdated(new Date());
    toast.success('Kategorien aktualisiert');
  };

  const handleEdit = (category: EventCategoryWithStats) => {
    setSelectedCategory(category);
    setShowModal(true);
  };

  const handleDelete = (category: EventCategoryWithStats) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const handleCreateNew = () => {
    setSelectedCategory(null);
    setShowModal(true);
  };

  const modalLoading =
    createCategoryMutation.isPending || updateCategoryMutation.isPending;
  const deleteLoading = deleteCategoryMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Event Categories</h1>
          <p className="text-sm text-gray-600">
            Verwalte Kategorien für Community Events
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {categories.length === 0 && !isLoading && (
            <button
              onClick={handleCreateDefaults}
              disabled={modalLoading}
              className="flex items-center rounded-md bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
            >
              <Zap className="mr-1 h-4 w-4" />
              Standard-Kategorien erstellen
            </button>
          )}

          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center rounded-md bg-gray-600 px-3 py-2 text-sm text-white hover:bg-gray-700 disabled:opacity-50"
          >
            <RefreshCw
              className={`mr-1 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
            Aktualisieren
          </button>

          <button
            onClick={handleCreateNew}
            className="flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700"
          >
            <Plus className="mr-1 h-4 w-4" />
            Neue Kategorie
          </button>
        </div>
      </div>

      {lastUpdated && (
        <div className="text-xs text-gray-500">
          Letzte Aktualisierung: {lastUpdated.toLocaleTimeString('de-DE')}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-indigo-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">
                Kategorien gesamt
              </p>
              <p className="text-lg font-bold text-gray-900">
                {categories.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">
                Verwendete Kategorien
              </p>
              <p className="text-lg font-bold text-gray-900">
                {categories.filter((c) => c.event_count > 0).length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Events gesamt</p>
              <p className="text-lg font-bold text-gray-900">
                {categories.reduce((sum, c) => sum + c.event_count, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-indigo-600" />
        </div>
      ) : categories.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Kategorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Beschreibung
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                  Events
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                  Erstellt
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {category.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs truncate text-sm text-gray-600">
                      {category.description || 'Keine Beschreibung'}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        category.event_count > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {category.event_count}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500">
                    {new Date(category.created_at).toLocaleDateString('de-DE')}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="rounded-md bg-indigo-50 p-2 text-indigo-600 hover:bg-indigo-100"
                        title="Bearbeiten"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category)}
                        className={`rounded-md p-2 ${
                          category.can_delete
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'cursor-not-allowed bg-gray-50 text-gray-400'
                        }`}
                        title={
                          category.can_delete
                            ? 'Löschen'
                            : 'Kann nicht gelöscht werden (wird verwendet)'
                        }
                        disabled={!category.can_delete}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Noch keine Event-Kategorien
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Erstelle deine ersten Kategorien, um Events zu organisieren.
          </p>
          <div className="mt-4 space-x-3">
            <button
              onClick={handleCreateDefaults}
              disabled={modalLoading}
              className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
            >
              <Zap className="mr-1 h-4 w-4" />
              Standard-Kategorien erstellen
            </button>
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
            >
              <Plus className="mr-1 h-4 w-4" />
              Erste Kategorie erstellen
            </button>
          </div>
        </div>
      )}

      <CategoryModal
        isOpen={showModal}
        category={selectedCategory}
        onClose={() => {
          setShowModal(false);
          setSelectedCategory(null);
        }}
        onSave={handleSaveCategory}
        isLoading={modalLoading}
      />

      <DeleteConfirmation
        isOpen={showDeleteModal}
        category={selectedCategory}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedCategory(null);
        }}
        onConfirm={handleDeleteCategory}
        isLoading={deleteLoading}
      />
    </div>
  );
}
