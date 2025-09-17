'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  X,
  MessageCircle,
  MapPin,
  Calendar,
  Send,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { toast } from '@/components/ui/toast';
import { apiClient } from '@/lib/api';
import type {
  CreateConversationData,
  CreateMessageData,
  Conversation,
} from '@/types/message';

interface InterestFormData {
  message: string;
  proposed_meeting_location?: string;
  proposed_meeting_time?: string;
}

interface ServiceInfo {
  id: number;
  title: string;
  is_offering: boolean;
  interest_count: number;
  user: {
    id: number;
    display_name: string;
    profile_image_url?: string;
  };
  meeting_locations?: string[];
}

interface InterestExpressionModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceInfo;
  onSuccess?: (newInterestCount?: number) => void;
}

export function InterestExpressionModal({
  isOpen,
  onClose,
  service,
  onSuccess,
}: InterestExpressionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'message' | 'details'>('message');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<InterestFormData>({
    defaultValues: {
      message: '',
      proposed_meeting_location: '',
      proposed_meeting_time: '',
    },
  });

  const message = watch('message');

  const handleClose = () => {
    reset();
    setStep('message');
    onClose();
  };

  const handleConversationLogic = async (
    targetUserId: number,
    serviceTitle: string,
    initialMessage: string
  ) => {
    try {
      const conversationsResponse = await apiClient.messages.getConversations();

      const existingConversation = conversationsResponse.conversations.find(
        (conv) => {
          if (conv.participants.length !== 2) return false;

          return conv.participants.some((p) => p.user.id === targetUserId);
        }
      );

      if (existingConversation) {
        const messageData: CreateMessageData = {
          content: `Interesse an weiterem Service: "${serviceTitle}"

  ${initialMessage}

  Link: /services/${service.id}`,
        };

        await apiClient.messages.sendMessage(
          existingConversation.id,
          messageData
        );

        return {
          conversation: existingConversation,
          isNew: false,
          message: `Nachricht in existierendem Gespräch mit ${existingConversation.participants.find((p) => p.user.id === targetUserId)?.user.display_name} gesendet`,
        };
      }

      try {
        const canMessageCheck =
          await apiClient.messages.checkCanMessageUser(targetUserId);

        if (!canMessageCheck.can_message) {
          throw new Error(
            `Cannot message user: ${canMessageCheck.reason || 'User has disabled messages'}`
          );
        }
      } catch (error) {
        console.warn('checkCanMessageUser not available or failed:', error);
      }

      const conversationData: CreateConversationData = {
        participant_id: targetUserId,
        initial_message: `Interesse an Service: "${serviceTitle}"

  ${initialMessage}

  Link: ${window.location.origin}/services/${service.id}`,
      };

      const newConversation =
        await apiClient.messages.createConversation(conversationData);

      return {
        conversation: newConversation,
        isNew: true,
        message: `Neues Gespräch erstellt`,
      };
    } catch (error) {
      console.error('Conversation logic error:', error);
      throw error;
    }
  };

  const onSubmit = async (data: InterestFormData) => {
    setIsSubmitting(true);

    try {
      const initialMessage = `Hallo ${service.user.display_name},

  ${data.message.trim()}

  ${data.proposed_meeting_location ? `\nVorgeschlagener Treffpunkt: ${data.proposed_meeting_location}` : ''}
  ${data.proposed_meeting_time ? `\nVorgeschlagener Termin: ${new Date(data.proposed_meeting_time).toLocaleString('de-DE')}` : ''}

  Viele Grüße!`;

      const { isNew } = await handleConversationLogic(
        service.user.id,
        service.title,
        initialMessage
      );

      const interestResponse = await apiClient.services.expressInterest(
        service.id,
        data.message.trim()
      );

      if (onSuccess) {
        onSuccess(interestResponse.new_interest_count);
      }

      toast.success(
        'Nachricht gesendet!',
        isNew
          ? `Neues Gespräch mit ${service.user.display_name} erstellt.`
          : `Nachricht in existierendem Gespräch gesendet.`
      );

      reset();
      setStep('message');
      onClose();
    } catch (error) {
      console.error('Express interest error:', error);

      if (error instanceof Error) {
        if (error.message.includes('Cannot message user')) {
          toast.error(
            'Nachrichten deaktiviert',
            `${service.user.display_name} hat Nachrichten deaktiviert oder nimmt keine Nachrichten von unbekannten Personen an.`
          );
        } else if (error.message.includes('400')) {
          toast.error('Fehler', 'Gespräch konnte nicht erstellt werden.');
        } else if (error.message.includes('403')) {
          toast.error(
            'Nicht erlaubt',
            'Du kannst keine Nachricht an diesen Nutzer senden.'
          );
        } else {
          toast.error('Fehler', 'Nachricht konnte nicht gesendet werden.');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getServiceTypeText = () => {
    return service.is_offering ? 'angeboten' : 'gesucht';
  };

  const getPlaceholderMessage = () => {
    if (service.is_offering) {
      return `Hallo ${service.user.display_name},\n\nich interessiere mich für deinen Service "${service.title}". Könnten wir die Details besprechen?\n\nViele Grüße`;
    } else {
      return `Hallo ${service.user.display_name},\n\nich könnte dir bei "${service.title}" helfen. Lass uns gerne die Details besprechen.\n\nViele Grüße`;
    }
  };

  const getTomorrowMinTime = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0);
    return tomorrow.toISOString().slice(0, 16);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-5 w-5 text-community-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Interesse bekunden
            </h3>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-full p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-gray-200 p-4">
          <div className="flex items-start gap-3">
            <ProfileAvatar user={service.user} size="sm" />
            <div className="min-w-0 flex-1">
              <h4 className="truncate font-medium text-gray-900">
                {service.title}
              </h4>
              <p className="text-sm text-gray-600">
                Wird {getServiceTypeText()} von {service.user.display_name}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {step === 'message' && (
            <div className="space-y-4 p-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Nachricht *
                </label>
                <textarea
                  {...register('message', {
                    required: 'Nachricht ist erforderlich',
                    minLength: {
                      value: 10,
                      message: 'Nachricht muss mindestens 10 Zeichen lang sein',
                    },
                    maxLength: {
                      value: 500,
                      message: 'Nachricht darf maximal 500 Zeichen lang sein',
                    },
                  })}
                  rows={6}
                  className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-community-500 focus:outline-none focus:ring-2 focus:ring-community-500 focus:ring-offset-2"
                  placeholder={getPlaceholderMessage()}
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.message.message}
                  </p>
                )}
                <div className="mt-1 flex justify-between">
                  <p className="text-xs text-gray-500">
                    Stelle dich vor und erkläre dein Interesse
                  </p>
                  <p className="text-xs text-gray-500">{message.length}/500</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Abbrechen
                </Button>

                {service.meeting_locations &&
                service.meeting_locations.length > 0 ? (
                  <Button
                    type="button"
                    onClick={() => setStep('details')}
                    disabled={!message.trim() || message.trim().length < 10}
                    className="flex-1"
                  >
                    Weiter
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      !message.trim() ||
                      message.trim().length < 10
                    }
                    className="flex flex-1 items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Sende...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Senden
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}

          {step === 'details' && (
            <div className="space-y-4 p-4">
              <div className="mb-4 text-sm text-gray-600">
                Optional: Schlage einen Treffpunkt und Zeit vor
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  <MapPin className="mr-1 inline h-4 w-4" />
                  Treffpunkt (optional)
                </label>

                {service.meeting_locations &&
                  service.meeting_locations.length > 0 && (
                    <div className="mb-3">
                      <p className="mb-2 text-xs text-gray-500">
                        Vorgeschlagene Orte:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {service.meeting_locations.map((location, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => {
                              const currentValue = watch(
                                'proposed_meeting_location'
                              );
                              if (currentValue !== location) {
                                const event = { target: { value: location } };
                                register('proposed_meeting_location').onChange(
                                  event
                                );
                              }
                            }}
                            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                              watch('proposed_meeting_location') === location
                                ? 'border-community-300 bg-community-100 text-community-800'
                                : 'border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {location}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                <Input
                  {...register('proposed_meeting_location')}
                  placeholder="Oder eigenen Treffpunkt vorschlagen..."
                  className="text-sm"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  <Calendar className="mr-1 inline h-4 w-4" />
                  Wunschtermin (optional)
                </label>
                <Input
                  type="datetime-local"
                  {...register('proposed_meeting_time')}
                  min={getTomorrowMinTime()}
                  className="text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Schlage einen Termin vor (frühestens morgen)
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('message')}
                  disabled={isSubmitting}
                >
                  Zurück
                </Button>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex flex-1 items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Sende...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Senden
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
