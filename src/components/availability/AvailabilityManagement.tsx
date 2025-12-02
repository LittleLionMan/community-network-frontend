'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, Calendar, Clock, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  useMyAvailability,
  useCreateAvailabilitySlot,
  useUpdateAvailabilitySlot,
  useDeleteAvailabilitySlot,
} from '@/hooks/useAvailability';
import type {
  AvailabilitySlotCreate,
  AvailabilitySlotRead,
} from '@/types/availability';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const WEEKDAYS = [
  'Montag',
  'Dienstag',
  'Mittwoch',
  'Donnerstag',
  'Freitag',
  'Samstag',
  'Sonntag',
];

type SlotFormData = {
  type: 'recurring' | 'specific';
  day_of_week?: number;
  start_time?: string;
  end_time?: string;
  specific_date?: Date;
  specific_start_time?: string;
  specific_end_time?: string;
  title?: string;
  notes?: string;
};

export function AvailabilityManagement() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<AvailabilitySlotRead | null>(
    null
  );
  const [deletingSlotId, setDeletingSlotId] = useState<number | null>(null);

  const { data: slots, isLoading } = useMyAvailability(false);
  const createSlot = useCreateAvailabilitySlot();
  const updateSlot = useUpdateAvailabilitySlot();
  const deleteSlot = useDeleteAvailabilitySlot();

  const recurringSlots =
    slots?.filter(
      (s) => s.day_of_week !== null && s.day_of_week !== undefined
    ) || [];
  const specificSlots =
    slots?.filter(
      (s) => s.specific_date !== null && s.specific_date !== undefined
    ) || [];

  const handleCreate = (data: SlotFormData) => {
    let slotData: AvailabilitySlotCreate;

    if (data.type === 'recurring') {
      if (!data.start_time || !data.end_time) return;

      const startTime = data.start_time.includes(':00:')
        ? data.start_time
        : `${data.start_time}:00`;
      const endTime = data.end_time.includes(':00:')
        ? data.end_time
        : `${data.end_time}:00`;

      slotData = {
        slot_type: 'available',
        title: data.title,
        notes: data.notes,
        is_active: true,
        day_of_week: data.day_of_week!,
        start_time: startTime,
        end_time: endTime,
      };
    } else {
      if (
        !data.specific_date ||
        !data.specific_start_time ||
        !data.specific_end_time
      ) {
        return;
      }

      const dateStr = format(data.specific_date, 'yyyy-MM-dd');
      const startTime = data.specific_start_time.includes(':')
        ? data.specific_start_time
        : `${data.specific_start_time}:00`;
      const endTime = data.specific_end_time.includes(':')
        ? data.specific_end_time
        : `${data.specific_end_time}:00`;

      const startDateTime = `${dateStr}T${startTime}`;
      const endDateTime = `${dateStr}T${endTime}`;

      slotData = {
        slot_type: 'available',
        title: data.title,
        notes: data.notes,
        is_active: true,
        specific_date: dateStr,
        specific_start: startDateTime,
        specific_end: endDateTime,
      };
    }

    createSlot.mutate(slotData);
    setShowCreateModal(false);
  };

  const handleUpdate = (slotId: number, title: string, notes: string) => {
    updateSlot.mutate({
      slotId,
      data: { title, notes },
    });
    setEditingSlot(null);
  };

  const handleDelete = (slotId: number) => {
    deleteSlot.mutate({ slotId, hardDelete: true });
    setDeletingSlotId(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Lade Verfügbarkeit...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Meine Verfügbarkeit
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Gib an, wann du verfügbar bist
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="w-full bg-indigo-600 hover:bg-indigo-700 sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Verfügbarkeit hinzufügen
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <h3 className="mb-4 flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100">
            <Calendar className="h-5 w-5" />
            Wöchentliche Verfügbarkeit
          </h3>

          {recurringSlots.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
              Noch keine wöchentlichen Zeiten festgelegt
            </p>
          ) : (
            <div className="space-y-2">
              {recurringSlots.map((slot) => (
                <SlotCard
                  key={slot.id}
                  slot={slot}
                  isEditing={editingSlot?.id === slot.id}
                  onEdit={() => setEditingSlot(slot)}
                  onSave={(title, notes) => handleUpdate(slot.id, title, notes)}
                  onCancel={() => setEditingSlot(null)}
                  onDelete={() => setDeletingSlotId(slot.id)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <h3 className="mb-4 flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100">
            <Clock className="h-5 w-5" />
            Spezifische Termine
          </h3>

          {specificSlots.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
              Noch keine spezifischen Termine festgelegt
            </p>
          ) : (
            <div className="space-y-2">
              {specificSlots.map((slot) => (
                <SlotCard
                  key={slot.id}
                  slot={slot}
                  isEditing={editingSlot?.id === slot.id}
                  onEdit={() => setEditingSlot(slot)}
                  onSave={(title, notes) => handleUpdate(slot.id, title, notes)}
                  onCancel={() => setEditingSlot(null)}
                  onDelete={() => setDeletingSlotId(slot.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg bg-indigo-50 p-4 dark:bg-indigo-950">
        <h3 className="mb-2 font-medium text-indigo-900 dark:text-indigo-200">
          Hinweis
        </h3>
        <p className="text-sm text-indigo-800 dark:text-indigo-300">
          Diese Zeiten werden anderen Nutzern angezeigt, wenn sie Termine mit
          dir vereinbaren möchten. Blockierte Zeiten (z.B. durch bestätigte
          Termine) werden automatisch verwaltet.
        </p>
      </div>

      {showCreateModal && (
        <CreateSlotModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreate}
        />
      )}

      {deletingSlotId !== null && (
        <DeleteConfirmModal
          onClose={() => setDeletingSlotId(null)}
          onConfirm={() => handleDelete(deletingSlotId)}
        />
      )}
    </div>
  );
}

function SlotCard({
  slot,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
}: {
  slot: AvailabilitySlotRead;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (title: string, notes: string) => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(slot.title || '');
  const [notes, setNotes] = useState(slot.notes || '');

  const isRecurring = slot.day_of_week !== undefined;
  const isManual = slot.source === 'manual';

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
      {isEditing ? (
        <div className="space-y-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titel (optional)"
            className="w-full rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700"
          />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notizen (optional)"
            rows={2}
            className="w-full rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => onSave(title, notes)}
              className="flex-1"
            >
              <Save className="mr-1 h-3 w-3" />
              Speichern
            </Button>
            <Button size="sm" variant="outline" onClick={onCancel}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-2 flex items-start justify-between">
            <div className="flex-1">
              {slot.title && (
                <div className="mb-1 font-medium text-gray-900 dark:text-gray-100">
                  {slot.title}
                </div>
              )}
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {isRecurring ? (
                  <>
                    {WEEKDAYS[slot.day_of_week!]},{' '}
                    {slot.start_time?.slice(0, 5)} -{' '}
                    {slot.end_time?.slice(0, 5)} Uhr
                  </>
                ) : (
                  <>
                    {slot.specific_date ? (
                      <>
                        {format(new Date(slot.specific_date), 'dd.MM.yyyy', {
                          locale: de,
                        })}
                        {slot.specific_start && slot.specific_end ? (
                          <>
                            ,{' '}
                            {slot.specific_start.includes('T')
                              ? slot.specific_start
                                  .split('T')[1]
                                  .replace('Z', '')
                                  .slice(0, 5)
                              : slot.specific_start.slice(0, 5)}{' '}
                            -{' '}
                            {slot.specific_end.includes('T')
                              ? slot.specific_end
                                  .split('T')[1]
                                  .replace('Z', '')
                                  .slice(0, 5)
                              : slot.specific_end.slice(0, 5)}{' '}
                            Uhr
                          </>
                        ) : (
                          <span className="text-red-500">
                            {' '}
                            [Keine Zeit-Daten]
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-red-500">[Kein Datum]</span>
                    )}
                  </>
                )}
              </div>
              {slot.notes && (
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {slot.notes}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant={
                  slot.slot_type === 'available' ? 'success' : 'secondary'
                }
                className="text-xs"
              >
                {slot.slot_type === 'available' ? 'Verfügbar' : 'Blockiert'}
              </Badge>
              {!isManual && (
                <Badge variant="outline" className="text-xs">
                  {slot.source === 'transaction' ? 'Transaction' : 'Event'}
                </Badge>
              )}
            </div>
          </div>

          {isManual && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={onEdit}
                className="flex-1"
              >
                <Edit className="mr-1 h-3 w-3" />
                Bearbeiten
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onDelete}
                className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CreateSlotModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (data: SlotFormData) => void;
}) {
  const [type, setType] = useState<'recurring' | 'specific'>('recurring');
  const [formData, setFormData] = useState<SlotFormData>({
    type: 'recurring',
    day_of_week: 0,
    start_time: '09:00',
    end_time: '17:00',
    specific_date: undefined,
    specific_start_time: undefined,
    specific_end_time: undefined,
    title: '',
    notes: '',
  });

  const handleTypeChange = (newType: 'recurring' | 'specific') => {
    setType(newType);
    if (newType === 'recurring') {
      setFormData({
        type: 'recurring',
        day_of_week: 0,
        start_time: '09:00',
        end_time: '17:00',
        specific_date: undefined,
        specific_start_time: undefined,
        specific_end_time: undefined,
        title: formData.title || '',
        notes: formData.notes || '',
      });
    } else {
      setFormData({
        type: 'specific',
        day_of_week: undefined,
        start_time: undefined,
        end_time: undefined,
        specific_date: new Date(),
        specific_start_time: '09:00',
        specific_end_time: '17:00',
        title: formData.title || '',
        notes: formData.notes || '',
      });
    }
  };

  const handleSubmit = () => {
    if (type === 'recurring') {
      if (
        formData.day_of_week === undefined ||
        !formData.start_time ||
        !formData.end_time
      ) {
        return;
      }
    } else {
      if (
        !formData.specific_date ||
        !formData.specific_start_time ||
        !formData.specific_end_time
      ) {
        return;
      }
    }

    onCreate({ ...formData, type });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-4 shadow-xl dark:bg-gray-800 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Verfügbarkeit hinzufügen
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Typ
            </label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={type === 'recurring' ? 'default' : 'outline'}
                onClick={() => handleTypeChange('recurring')}
                className="flex-1"
              >
                Wöchentlich
              </Button>
              <Button
                type="button"
                variant={type === 'specific' ? 'default' : 'outline'}
                onClick={() => handleTypeChange('specific')}
                className="flex-1"
              >
                Spezifisch
              </Button>
            </div>
          </div>

          {type === 'recurring' ? (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Wochentag
                </label>
                <select
                  value={formData.day_of_week}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      day_of_week: parseInt(e.target.value),
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                >
                  {WEEKDAYS.map((day, idx) => (
                    <option key={idx} value={idx}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Von
                  </label>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={formData.start_time?.split(':')[0] || '09'}
                      onChange={(e) => {
                        const hour = e.target.value.padStart(2, '0');
                        const minute =
                          formData.start_time?.split(':')[1] || '00';
                        setFormData({
                          ...formData,
                          start_time: `${hour}:${minute}`,
                        });
                      }}
                      className="w-16 rounded-lg border border-gray-300 px-2 py-2 text-center dark:border-gray-600 dark:bg-gray-700"
                      placeholder="09"
                    />
                    <span className="flex items-center text-gray-500">:</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      step="15"
                      value={formData.start_time?.split(':')[1] || '00'}
                      onChange={(e) => {
                        const hour = formData.start_time?.split(':')[0] || '09';
                        const minute = e.target.value.padStart(2, '0');
                        setFormData({
                          ...formData,
                          start_time: `${hour}:${minute}`,
                        });
                      }}
                      className="w-16 rounded-lg border border-gray-300 px-2 py-2 text-center dark:border-gray-600 dark:bg-gray-700"
                      placeholder="00"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Bis
                  </label>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={formData.end_time?.split(':')[0] || '17'}
                      onChange={(e) => {
                        const hour = e.target.value.padStart(2, '0');
                        const minute = formData.end_time?.split(':')[1] || '00';
                        setFormData({
                          ...formData,
                          end_time: `${hour}:${minute}`,
                        });
                      }}
                      className="w-16 rounded-lg border border-gray-300 px-2 py-2 text-center dark:border-gray-600 dark:bg-gray-700"
                      placeholder="17"
                    />
                    <span className="flex items-center text-gray-500">:</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      step="15"
                      value={formData.end_time?.split(':')[1] || '00'}
                      onChange={(e) => {
                        const hour = formData.end_time?.split(':')[0] || '17';
                        const minute = e.target.value.padStart(2, '0');
                        setFormData({
                          ...formData,
                          end_time: `${hour}:${minute}`,
                        });
                      }}
                      className="w-16 rounded-lg border border-gray-300 px-2 py-2 text-center dark:border-gray-600 dark:bg-gray-700"
                      placeholder="00"
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Datum
                </label>
                <input
                  type="date"
                  value={
                    formData.specific_date
                      ? format(formData.specific_date, 'yyyy-MM-dd')
                      : ''
                  }
                  onChange={(e) => {
                    const date = e.target.value
                      ? new Date(e.target.value + 'T00:00:00')
                      : undefined;
                    setFormData({ ...formData, specific_date: date });
                  }}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                />
                {formData.specific_date && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Gewählt:{' '}
                    {format(formData.specific_date, 'dd.MM.yyyy', {
                      locale: de,
                    })}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Von
                  </label>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={
                        formData.specific_start_time?.split(':')[0] || '09'
                      }
                      onChange={(e) => {
                        const hour = e.target.value.padStart(2, '0');
                        const minute =
                          formData.specific_start_time?.split(':')[1] || '00';
                        setFormData({
                          ...formData,
                          specific_start_time: `${hour}:${minute}`,
                        });
                      }}
                      className="w-16 rounded-lg border border-gray-300 px-2 py-2 text-center dark:border-gray-600 dark:bg-gray-700"
                      placeholder="09"
                    />
                    <span className="flex items-center text-gray-500">:</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      step="15"
                      value={
                        formData.specific_start_time?.split(':')[1] || '00'
                      }
                      onChange={(e) => {
                        const hour =
                          formData.specific_start_time?.split(':')[0] || '09';
                        const minute = e.target.value.padStart(2, '0');
                        setFormData({
                          ...formData,
                          specific_start_time: `${hour}:${minute}`,
                        });
                      }}
                      className="w-16 rounded-lg border border-gray-300 px-2 py-2 text-center dark:border-gray-600 dark:bg-gray-700"
                      placeholder="00"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Bis
                  </label>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={formData.specific_end_time?.split(':')[0] || '17'}
                      onChange={(e) => {
                        const hour = e.target.value.padStart(2, '0');
                        const minute =
                          formData.specific_end_time?.split(':')[1] || '00';
                        setFormData({
                          ...formData,
                          specific_end_time: `${hour}:${minute}`,
                        });
                      }}
                      className="w-16 rounded-lg border border-gray-300 px-2 py-2 text-center dark:border-gray-600 dark:bg-gray-700"
                      placeholder="17"
                    />
                    <span className="flex items-center text-gray-500">:</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      step="15"
                      value={formData.specific_end_time?.split(':')[1] || '00'}
                      onChange={(e) => {
                        const hour =
                          formData.specific_end_time?.split(':')[0] || '17';
                        const minute = e.target.value.padStart(2, '0');
                        setFormData({
                          ...formData,
                          specific_end_time: `${hour}:${minute}`,
                        });
                      }}
                      className="w-16 rounded-lg border border-gray-300 px-2 py-2 text-center dark:border-gray-600 dark:bg-gray-700"
                      placeholder="00"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Titel (optional)
            </label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="z.B. Nachmittags verfügbar"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Notizen (optional)
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={2}
              placeholder="Zusätzliche Informationen..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Abbrechen
          </Button>
          <Button onClick={handleSubmit} className="flex-1">
            <Plus className="mr-2 h-4 w-4" />
            Hinzufügen
          </Button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirmModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Verfügbarkeit löschen?
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          Möchtest du diese Verfügbarkeit wirklich löschen? Diese Aktion kann
          nicht rückgängig gemacht werden.
        </p>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Abbrechen
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Löschen
          </Button>
        </div>
      </div>
    </div>
  );
}
