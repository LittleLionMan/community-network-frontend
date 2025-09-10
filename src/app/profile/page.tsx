'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { User, Settings, Shield, Activity, Edit, Check, X } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { ProfileCompletion } from '@/components/profile/ProfileCompletion';
import { PrivacyControls } from '@/components/profile/PrivacyControls';
import { EditProfileForm } from '@/components/profile/EditProfileForm';
import { PublicProfileView } from '@/components/profile/PublicProfileView';
import { PasswordUpdateForm } from '@/components/profile/PasswordUpdateForm';
import { ProfileImageUpload } from '@/components/profile/ProfileImageUpload';
import { AccountDeletionModal } from '@/components/profile/AccountDeletionModal';
import { apiClient } from '@/lib/api';

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = searchParams.get('tab') || 'profile';

  const { user, isLoading, updateProfile, updatePrivacy, updateProfileImage } =
    useProfile();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Nicht angemeldet
          </h2>
          <p className="text-gray-600">
            Bitte melde dich an um dein Profil zu sehen.
          </p>
        </div>
      </div>
    );
  }

  const handleProfileSave = async (
    formData: Parameters<typeof updateProfile>[0]
  ) => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
      setToastMessage({
        type: 'success',
        message: 'Profil erfolgreich aktualisiert',
      });
    } catch (error) {
      console.error('Profile update failed:', error);
      setToastMessage({
        type: 'error',
        message: 'Profil-Update fehlgeschlagen',
      });
    }
  };

  const handlePrivacyChange = async (field: string, value: boolean) => {
    try {
      await updatePrivacy({ [field]: value });
      setToastMessage({
        type: 'success',
        message: 'Privacy-Einstellungen aktualisiert',
      });
    } catch (error) {
      console.error('Privacy update failed:', error);
      setToastMessage({
        type: 'error',
        message: 'Privacy-Update fehlgeschlagen',
      });
    }
  };

  const handleImageUpdate = (imageUrl: string | null) => {
    updateProfileImage(imageUrl);

    setToastMessage({
      type: 'success',
      message: imageUrl
        ? 'Profilbild erfolgreich aktualisiert'
        : 'Profilbild entfernt',
    });
  };

  const handlePasswordUpdate = () => {
    setShowPasswordForm(false);
    setToastMessage({
      type: 'success',
      message: 'Passwort erfolgreich geändert',
    });
  };

  const handleAccountDeletion = async () => {
    setIsDeleting(true);
    try {
      await apiClient.auth.deleteAccount();

      localStorage.removeItem('auth_token');
      apiClient.setToken(null);

      setToastMessage({
        type: 'success',
        message: 'Account wurde erfolgreich deaktiviert',
      });

      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error) {
      console.error('Account deletion failed:', error);
      setToastMessage({
        type: 'error',
        message: 'Account-Deaktivierung fehlgeschlagen',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleNotificationChange = async (field: string, value: boolean) => {
    try {
      await updateProfile({ [field]: value });
      setToastMessage({
        type: 'success',
        message: 'E-Mail-Benachrichtigungen aktualisiert',
      });
    } catch (error) {
      console.error('Notification update failed:', error);
      setToastMessage({
        type: 'error',
        message: 'Benachrichtigungs-Update fehlgeschlagen',
      });
    }
  };

  const getVisibleData = () => {
    const visibleData: Partial<typeof user> = {
      display_name: user.display_name,
      id: user.id,
    };

    if (!user.email_private) visibleData.email = user.email;
    if (!user.first_name_private && user.first_name)
      visibleData.first_name = user.first_name;
    if (!user.last_name_private && user.last_name)
      visibleData.last_name = user.last_name;
    if (!user.bio_private && user.bio) visibleData.bio = user.bio;
    if (!user.location_private && user.location)
      visibleData.location = user.location;
    if (!user.created_at_private) visibleData.created_at = user.created_at;

    if (user.profile_image_url) {
      visibleData.profile_image_url = user.profile_image_url;
    }

    return visibleData;
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'activity', label: 'Aktivitäten', icon: Activity },
    { id: 'settings', label: 'Einstellungen', icon: Settings },
  ];

  return (
    <div className="mx-auto max-w-4xl p-6">
      {toastMessage && (
        <div
          className={`fixed right-4 top-4 z-50 rounded-lg p-4 shadow-lg ${
            toastMessage.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          <div className="flex items-center">
            {toastMessage.type === 'success' ? (
              <Check className="mr-2 h-5 w-5" />
            ) : (
              <X className="mr-2 h-5 w-5" />
            )}
            {toastMessage.message}
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Mein Profil</h1>
        <p className="text-gray-600">
          Verwalte deine persönlichen Daten und Privacy-Einstellungen
        </p>
      </div>

      <div className="mb-8 border-b border-gray-200">
        <div className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center border-b-2 px-1 py-2 text-sm font-medium ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <Icon className="mr-2 h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {activeTab === 'profile' && (
            <div className="space-y-8">
              <div>
                <h2 className="mb-4 text-xl font-semibold text-gray-900">
                  Profilbild
                </h2>
                <ProfileImageUpload
                  currentUser={{
                    id: user.id,
                    display_name: user.display_name,
                    profile_image_url: user.profile_image_url,
                  }}
                  onImageUpdate={handleImageUpdate}
                  isLoading={isLoading}
                />
              </div>

              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Profil-Informationen
                  </h2>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center text-indigo-600 hover:text-indigo-800"
                    >
                      <Edit className="mr-1 h-4 w-4" />
                      Bearbeiten
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <EditProfileForm
                    user={user}
                    onSave={handleProfileSave}
                    onCancel={() => setIsEditing(false)}
                    isLoading={isLoading}
                  />
                ) : (
                  <PublicProfileView
                    user={user}
                    stats={{ events_attended: 0, services_offered: 0 }}
                    isOwnProfile={true}
                  />
                )}
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <PrivacyControls
              user={user}
              onPrivacyChange={handlePrivacyChange}
              showPreview={() => setShowPreview(true)}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'activity' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Meine Aktivitäten
              </h2>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-lg bg-blue-50 p-6">
                  <h3 className="mb-2 font-medium text-blue-900">Events</h3>
                  <div className="mb-1 text-3xl font-bold text-blue-600">0</div>
                  <div className="text-sm text-blue-700">Teilgenommen</div>
                  <div className="mt-2 text-lg font-semibold text-blue-600">
                    0
                  </div>
                  <div className="text-sm text-blue-700">Organisiert</div>
                </div>

                <div className="rounded-lg bg-green-50 p-6">
                  <h3 className="mb-2 font-medium text-green-900">Services</h3>
                  <div className="mb-1 text-3xl font-bold text-green-600">
                    0
                  </div>
                  <div className="text-sm text-green-700">Angeboten</div>
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <div className="mb-1 text-sm text-gray-600">
                  Community Score
                </div>
                <div className="flex items-center">
                  <div className="mr-3 h-2 flex-1 rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-indigo-600"
                      style={{ width: `0%` }}
                    />
                  </div>
                  <span className="text-lg font-semibold text-indigo-600">
                    0/100
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Account-Einstellungen
              </h2>

              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <h3 className="mb-2 font-medium text-gray-900">
                    Email-Adresse
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-gray-900">{user.email}</div>
                      <div className="flex items-center text-sm text-green-600">
                        <Check className="mr-1 h-4 w-4" />
                        {user.email_verified ? 'Bestätigt' : 'Nicht bestätigt'}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-gray-600">
                    Wenn Sie ihre Mail-Adresse ändern wollen, wenden Sie sich
                    bitte an einen Administrator
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="mb-2 font-medium text-gray-900">Passwort</h3>
                  <div className="mb-3 text-sm text-gray-600">
                    Aus Sicherheitsgründen können wir das letzte Update nicht
                    anzeigen
                  </div>
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    Passwort ändern
                  </button>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="mb-2 font-medium text-gray-900">
                    E-Mail-Benachrichtigungen
                  </h3>
                  <div className="space-y-3 text-sm">
                    <label className="flex cursor-not-allowed items-center opacity-50">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={user.email_notifications_events || false}
                        disabled={true}
                      />
                      <span className="text-gray-500">
                        Event-Einladungen (to do)
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={user.email_notifications_messages || false}
                        onChange={(e) =>
                          handleNotificationChange(
                            'email_notifications_messages',
                            e.target.checked
                          )
                        }
                        disabled={isLoading}
                      />
                      <span className={isLoading ? 'opacity-50' : ''}>
                        Neue Nachrichten
                      </span>
                    </label>
                    <label className="flex cursor-not-allowed items-center opacity-50">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={user.email_notifications_newsletter || false}
                        disabled={true}
                      />
                      <span className="text-gray-500">
                        Newsletter (möglicherweise zukünftig)
                      </span>
                    </label>
                  </div>
                  <div className="mt-3 text-xs text-gray-600">
                    Du erhältst nur E-Mails wenn du gerade nicht in der App
                    aktiv bist.
                  </div>
                </div>

                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <h3 className="mb-2 font-medium text-red-900">
                    Gefahrenzone
                  </h3>
                  <div className="mb-3 text-sm text-red-700">
                    Das Deaktivieren Ihres Accounts kann nicht direkt rückgängig
                    gemacht werden. Kontaktieren Sie den Support für eine
                    Reaktivierung.
                  </div>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    disabled={isDeleting}
                    className="text-sm font-medium text-red-600 hover:text-red-800"
                  >
                    {isDeleting
                      ? 'Wird deaktiviert...'
                      : 'Account deaktivieren'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <ProfileCompletion user={user} />

          <div className="rounded-lg bg-indigo-50 p-4">
            <h3 className="mb-2 font-medium text-indigo-900">Privacy-Tipp</h3>
            <p className="text-sm text-indigo-800">
              Du kontrollierst vollständig, welche Informationen andere sehen
              können. Nutze die Vorschau-Funktion um zu prüfen, wie dein Profil
              für andere aussieht.
            </p>
          </div>
        </div>
      </div>

      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 max-h-[80vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Öffentliche Ansicht
              </h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4 text-sm text-gray-600">
              So sehen andere Community-Mitglieder dein Profil:
            </div>

            <PublicProfileView
              user={getVisibleData()}
              stats={{ events_attended: 0, services_offered: 0 }}
              isPreview={true}
            />
          </div>
        </div>
      )}

      {showPasswordForm && (
        <PasswordUpdateForm
          onSuccess={handlePasswordUpdate}
          onCancel={() => setShowPasswordForm(false)}
        />
      )}

      <AccountDeletionModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleAccountDeletion}
        isLoading={isDeleting}
      />
    </div>
  );
}
