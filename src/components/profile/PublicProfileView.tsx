'use client';

import { User, MapPin, Calendar, Check } from 'lucide-react';
import { MessageCircle } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import type { User as UserType } from '@/types';

interface PublicProfileViewProps {
  user: Partial<UserType>;
  stats?: {
    events_attended: number;
    services_offered: number;
  };
  isPreview?: boolean;
  isOwnProfile?: boolean;
}

interface SendMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId: number;
  recipientName: string;
  onSuccess: () => void;
}

const SendMessageModal: React.FC<SendMessageModalProps> = ({
  isOpen,
  onClose,
  recipientId,
  recipientName,
  onSuccess,
}) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const canMessageResponse =
        await apiClient.messages.checkCanMessageUser(recipientId);
      if (!canMessageResponse.can_message) {
        setError(
          canMessageResponse.reason || 'Nachricht kann nicht gesendet werden'
        );
        return;
      }

      await apiClient.messages.createConversation({
        participant_id: recipientId,
        initial_message: message.trim(),
      });

      onSuccess();
      onClose();
      setMessage('');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Fehler beim Senden der Nachricht'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="p-6">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Nachricht an {recipientName}
          </h2>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Nachricht
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Schreibe eine Nachricht..."
                rows={4}
                className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                required
                disabled={isLoading}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                disabled={isLoading}
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={!message.trim() || isLoading}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {isLoading ? 'Sende...' : 'Nachricht senden'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export function PublicProfileView({
  user,
  stats,
  isPreview = false,
  isOwnProfile = false,
}: PublicProfileViewProps) {
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showMessageSuccess, setShowMessageSuccess] = useState(false);
  const router = useRouter();

  const handleMessageSuccess = () => {
    setShowMessageSuccess(true);
    setTimeout(() => {
      setShowMessageSuccess(false);
      router.push('/messages');
    }, 2000);
  };
  return (
    <>
      <div className={`bg-white ${!isPreview ? 'border' : ''} rounded-lg p-6`}>
        <div className="mb-6 flex items-start space-x-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600">
            {user.profile_image_url ? (
              <img
                src={user.profile_image_url}
                alt={user.display_name || 'Profilbild'}
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-8 w-8 text-white" />
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {user.display_name}
            </h1>

            {(user.first_name || user.last_name) && (
              <p className="text-gray-600">
                {user.first_name} {user.last_name}
              </p>
            )}

            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
              {user.location && (
                <div className="flex items-center">
                  <MapPin className="mr-1 h-4 w-4" />
                  {user.location}
                </div>
              )}

              {user.created_at && (
                <div className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  Dabei seit{' '}
                  {new Date(user.created_at).toLocaleDateString('de-DE')}
                </div>
              )}
            </div>
          </div>
        </div>

        {user.bio && (
          <div className="mb-6">
            <h3 className="mb-2 font-medium text-gray-900">Über mich</h3>
            <p className="text-gray-700">{user.bio}</p>
          </div>
        )}

        <div className="mb-6 flex items-center space-x-4 text-sm">
          <div className="flex items-center text-green-600">
            <Check className="mr-1 h-4 w-4" />
            Email bestätigt
          </div>
        </div>

        {stats && (
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {stats.events_attended}
              </div>
              <div className="text-sm text-gray-600">Events besucht</div>
            </div>

            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.services_offered}
              </div>
              <div className="text-sm text-gray-600">Services angeboten</div>
            </div>
          </div>
        )}

        {!isPreview && user.id && !isOwnProfile && (
          <div className="space-y-3 border-t pt-6">
            <button
              onClick={() => setShowMessageModal(true)}
              className="flex w-full items-center justify-center space-x-2 rounded-md bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Nachricht senden</span>
            </button>
          </div>
        )}

        {showMessageSuccess && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            <div className="flex items-center">
              <Check className="mr-2 h-4 w-4" />
              Nachricht erfolgreich gesendet! Du wirst zu den Nachrichten
              weitergeleitet...
            </div>
          </div>
        )}
      </div>

      {user.id && user.display_name && (
        <SendMessageModal
          isOpen={showMessageModal}
          onClose={() => setShowMessageModal(false)}
          recipientId={user.id}
          recipientName={user.display_name}
          onSuccess={handleMessageSuccess}
        />
      )}
    </>
  );
}
