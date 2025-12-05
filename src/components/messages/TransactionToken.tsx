'use client';

import { useState } from 'react';
import { format, addDays } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Calendar,
  BookOpen,
  Loader2,
  X,
  LucideIcon,
  AlertCircle,
} from 'lucide-react';
import { TransactionData } from '@/types/transactions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AvailabilityCalendar } from '@/components/availability/AvailabilityCalendar';
import { useUserAvailability } from '@/hooks/useAvailability';
import {
  useProposeTime,
  useConfirmTime,
  useConfirmHandover,
  useCancelTransaction,
  useUpdateTransactionAddress,
} from '@/hooks/useTransactions';

interface TransactionTokenProps {
  transaction: TransactionData;
  currentUserId: number;
  onUpdate?: (updated: TransactionData) => void;
}

const statusConfig: Record<
  string,
  { label: string; color: string; icon: LucideIcon }
> = {
  pending: {
    label: 'In Abstimmung',
    color:
      'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20',
    icon: Clock,
  },
  accepted: {
    label: 'In Abstimmung',
    color:
      'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20',
    icon: Clock,
  },
  time_confirmed: {
    label: 'Termin bestätigt',
    color:
      'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20',
    icon: Calendar,
  },
  completed: {
    label: 'Abgeschlossen',
    color:
      'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Storniert',
    color: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800',
    icon: XCircle,
  },
  expired: {
    label: 'Abgelaufen',
    color: 'text-gray-500 bg-gray-50 dark:text-gray-400 dark:bg-gray-800',
    icon: Clock,
  },
};

export function TransactionToken({
  transaction,
  currentUserId,
  onUpdate,
}: TransactionTokenProps) {
  const [showProposeTimeModal, setShowProposeTimeModal] = useState(false);
  const [showConfirmTimeModal, setShowConfirmTimeModal] = useState(false);
  const [showEditAddressModal, setShowEditAddressModal] = useState(false);

  const proposeTimeMutation = useProposeTime();
  const confirmTimeMutation = useConfirmTime();
  const confirmHandoverMutation = useConfirmHandover();
  const cancelMutation = useCancelTransaction();
  const updateAddressMutation = useUpdateTransactionAddress();

  const isLoading =
    proposeTimeMutation.isPending ||
    confirmTimeMutation.isPending ||
    confirmHandoverMutation.isPending ||
    cancelMutation.isPending ||
    updateAddressMutation.isPending;

  const statusInfo = statusConfig[transaction.status];
  const StatusIcon = statusInfo.icon;
  const isProvider = currentUserId === transaction.provider.id;

  const counterpartId = isProvider
    ? transaction.requester.id
    : transaction.provider.id;

  const handleProposeTime = async (proposedTime: Date) => {
    const result = await proposeTimeMutation.mutateAsync({
      transactionId: transaction.transaction_id,
      data: { proposed_time: proposedTime.toISOString() },
    });
    onUpdate?.(result);
  };

  const handleConfirmTime = async (confirmedTime: string) => {
    const result = await confirmTimeMutation.mutateAsync({
      transactionId: transaction.transaction_id,
      data: {
        confirmed_time: confirmedTime,
        exact_address: transaction.exact_address || 'Münster',
      },
    });
    onUpdate?.(result);
  };

  const handleConfirmHandover = async () => {
    const result = await confirmHandoverMutation.mutateAsync({
      transactionId: transaction.transaction_id,
    });
    onUpdate?.(result);
  };

  const handleCancel = async () => {
    const result = await cancelMutation.mutateAsync({
      transactionId: transaction.transaction_id,
    });
    onUpdate?.(result);
  };

  const handleUpdateAddress = async (newAddress: string) => {
    const result = await updateAddressMutation.mutateAsync({
      transactionId: transaction.transaction_id,
      address: newAddress,
    });
    onUpdate?.(result);
  };

  return (
    <div className="my-4 rounded-lg border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white p-4 shadow-sm dark:border-amber-800 dark:from-amber-950/20 dark:to-gray-900">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          {transaction.offer.thumbnail_url ? (
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}${transaction.offer.thumbnail_url}`}
              alt={transaction.offer.title}
              className="h-16 w-12 rounded object-cover"
            />
          ) : (
            <div className="flex h-16 w-12 items-center justify-center rounded bg-amber-100 dark:bg-amber-900">
              <BookOpen className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
          )}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
              {transaction.offer.title}
            </h4>
            {transaction.offer.condition && (
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Zustand: {transaction.offer.condition}
              </p>
            )}
          </div>
        </div>
        <Badge className={statusInfo.color}>
          <StatusIcon className="mr-1 h-3 w-3" />
          {statusInfo.label}
        </Badge>
      </div>

      <div className="mb-3 space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <span className="font-medium">
            {isProvider ? 'Anfrage von' : 'Anfrage an'}:
          </span>
          <span>
            {isProvider
              ? transaction.requester.display_name
              : transaction.provider.display_name}
          </span>
        </div>
      </div>

      {transaction.proposed_times.length > 0 && (
        <div className="mb-3 rounded-lg bg-white p-3 dark:bg-gray-800">
          <h5 className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Calendar className="h-4 w-4" />
            Vorgeschlagene Termine
          </h5>
          <div className="space-y-1">
            {transaction.proposed_times.map((time, idx) => (
              <div
                key={idx}
                className="text-xs text-gray-700 dark:text-gray-300"
              >
                •{' '}
                {format(new Date(time), 'EEEE, dd.MM.yyyy HH:mm', {
                  locale: de,
                })}{' '}
                Uhr
              </div>
            ))}
          </div>
        </div>
      )}

      {transaction.confirmed_time && (
        <div className="mb-3 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
          <h5 className="mb-1 flex items-center gap-2 text-sm font-medium text-green-800 dark:text-green-300">
            <Calendar className="h-4 w-4" />
            Bestätigter Termin
          </h5>
          <p className="text-sm text-green-700 dark:text-green-400">
            {format(
              new Date(transaction.confirmed_time),
              'EEEE, dd.MM.yyyy HH:mm',
              {
                locale: de,
              }
            )}{' '}
            Uhr
          </p>
        </div>
      )}

      {transaction.exact_address && (
        <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h5 className="mb-1 flex items-center gap-2 text-sm font-medium text-blue-800 dark:text-blue-300">
                <MapPin className="h-4 w-4" />
                Treffpunkt
              </h5>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                {transaction.exact_address}
              </p>
            </div>
            {transaction.can_edit_address && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowEditAddressModal(true)}
                className="ml-2 text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/30"
              >
                Bearbeiten
              </Button>
            )}
          </div>
        </div>
      )}

      {(transaction.requester_confirmed || transaction.provider_confirmed) && (
        <div className="mb-3 text-xs text-gray-600 dark:text-gray-400">
          {transaction.requester_confirmed && (
            <div>
              ✓ {transaction.requester.display_name} hat Übergabe bestätigt
            </div>
          )}
          {transaction.provider_confirmed && (
            <div>
              ✓ {transaction.provider.display_name} hat Übergabe bestätigt
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2 border-t border-gray-200 pt-3 dark:border-gray-700">
        {transaction.can_propose_time && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowProposeTimeModal(true)}
            disabled={isLoading}
            className="border-gray-400 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
          >
            <Calendar className="mr-1 h-3 w-3" />
            Termin vorschlagen
          </Button>
        )}

        {transaction.can_confirm_time && (
          <Button
            size="sm"
            onClick={() => setShowConfirmTimeModal(true)}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Termin bestätigen
          </Button>
        )}

        {transaction.can_confirm_handover && (
          <Button
            size="sm"
            onClick={handleConfirmHandover}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {confirmHandoverMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Übergabe bestätigen'
            )}
          </Button>
        )}

        {transaction.can_cancel && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="border-gray-400 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
          >
            {cancelMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Stornieren'
            )}
          </Button>
        )}
      </div>

      {showProposeTimeModal && (
        <ProposeTimeModal
          counterpartId={counterpartId}
          onClose={() => setShowProposeTimeModal(false)}
          onSubmit={(time) => {
            handleProposeTime(time);
            setShowProposeTimeModal(false);
          }}
        />
      )}

      {showConfirmTimeModal && (
        <ConfirmTimeModal
          proposedTimes={transaction.proposed_times}
          currentAddress={transaction.exact_address}
          onClose={() => setShowConfirmTimeModal(false)}
          onSubmit={(time) => {
            handleConfirmTime(time);
            setShowConfirmTimeModal(false);
          }}
        />
      )}

      {showEditAddressModal && (
        <EditAddressModal
          currentAddress={transaction.exact_address || ''}
          onClose={() => setShowEditAddressModal(false)}
          onSubmit={(address) => {
            handleUpdateAddress(address);
            setShowEditAddressModal(false);
          }}
        />
      )}
    </div>
  );
}

function ProposeTimeModal({
  counterpartId,
  onClose,
  onSubmit,
}: {
  counterpartId: number;
  onClose: () => void;
  onSubmit: (time: Date) => void;
}) {
  const [selectedTimes, setSelectedTimes] = useState<Date[]>([]);

  const endDate = format(addDays(new Date(), 30), 'yyyy-MM-dd');
  const { data: availability, isLoading } = useUserAvailability(
    counterpartId,
    undefined,
    endDate
  );

  const handleAddTime = (time: Date) => {
    if (selectedTimes.length >= 5) {
      return;
    }
    if (!selectedTimes.find((t) => t.getTime() === time.getTime())) {
      setSelectedTimes([...selectedTimes, time]);
    }
  };

  const handleRemoveTime = (index: number) => {
    setSelectedTimes(selectedTimes.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (selectedTimes.length > 0) {
      onSubmit(selectedTimes[0]);
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 top-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-8">
      <div className="my-auto w-full max-w-2xl rounded-lg bg-white p-4 shadow-xl dark:bg-gray-800 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Termin vorschlagen
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              {availability && availability.length > 0 ? (
                <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                  Wähle verfügbare Zeitslots aus dem Kalender (max. 5):
                </p>
              ) : (
                <p className="mb-3 text-sm text-amber-600 dark:text-amber-400">
                  <AlertCircle className="mb-1 mr-1 inline h-4 w-4" />
                  Die andere Person hat noch keine Verfügbarkeiten festgelegt.
                  Du kannst trotzdem beliebige zukünftige Zeiten vorschlagen.
                </p>
              )}
              <AvailabilityCalendar
                slots={availability || []}
                onSelectTime={handleAddTime}
                selectedTimes={selectedTimes}
                mode="select"
                minDate={new Date()}
              />
            </>
          )}
        </div>

        {selectedTimes.length > 0 && (
          <div className="mb-4 space-y-2">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Ausgewählte Termine ({selectedTimes.length}/5):
            </p>
            {selectedTimes.map((time, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-2 dark:border-green-800 dark:bg-green-900/20"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-green-900 dark:text-green-200">
                    {format(time, 'EEEE, dd.MM.yyyy HH:mm', {
                      locale: de,
                    })}{' '}
                    Uhr
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveTime(idx)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Abbrechen
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedTimes.length === 0}
            className="flex-1"
          >
            Vorschlagen ({selectedTimes.length})
          </Button>
        </div>
      </div>
    </div>
  );
}

function ConfirmTimeModal({
  proposedTimes,
  currentAddress,
  onClose,
  onSubmit,
}: {
  proposedTimes: string[];
  currentAddress: string | null;
  onClose: () => void;
  onSubmit: (time: string) => void;
}) {
  const [selectedTime, setSelectedTime] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Termin bestätigen
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
              Wähle einen Termin
            </label>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
            >
              <option value="">-- Bitte wählen --</option>
              {proposedTimes.map((time, idx) => (
                <option key={idx} value={time}>
                  {format(new Date(time), 'EEEE, dd.MM.yyyy HH:mm', {
                    locale: de,
                  })}{' '}
                  Uhr
                </option>
              ))}
            </select>
          </div>

          {currentAddress && (
            <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
              <div className="mb-1 flex items-center gap-2 text-sm font-medium text-blue-800 dark:text-blue-300">
                <MapPin className="h-4 w-4" />
                Treffpunkt
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                {currentAddress}
              </p>
            </div>
          )}

          {!currentAddress && (
            <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                ⚠️ Kein Treffpunkt festgelegt. Der Anbieter sollte einen
                Treffpunkt angeben.
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Abbrechen
          </Button>
          <Button
            onClick={() => selectedTime && onSubmit(selectedTime)}
            disabled={!selectedTime || !currentAddress}
            className="flex-1"
          >
            Bestätigen
          </Button>
        </div>
      </div>
    </div>
  );
}

function EditAddressModal({
  currentAddress,
  onClose,
  onSubmit,
}: {
  currentAddress: string;
  onClose: () => void;
  onSubmit: (address: string) => void;
}) {
  const [address, setAddress] = useState(currentAddress);

  return (
    <div className="fixed inset-x-0 bottom-0 top-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-8">
      <div className="my-auto w-full max-w-2xl rounded-lg bg-white p-4 shadow-xl dark:bg-gray-800 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Treffpunkt bearbeiten
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
              Adresse
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Straße, Hausnummer, Münster"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
              maxLength={500}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Dies wird der Treffpunkt für die Übergabe. Du kannst ihn nur vor
              der Terminbestätigung ändern.
            </p>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Abbrechen
          </Button>
          <Button
            onClick={() => address && onSubmit(address)}
            disabled={!address || address === currentAddress}
            className="flex-1"
          >
            Speichern
          </Button>
        </div>
      </div>
    </div>
  );
}
