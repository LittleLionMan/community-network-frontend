'use client';

import { useState, useEffect } from 'react';
import { Bell, MessageSquare, AtSign, Quote } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from '@/components/ui/toast';

interface NotificationPrivacySettings {
  forum_reply_enabled: boolean;
  forum_mention_enabled: boolean;
  forum_quote_enabled: boolean;
}

export function NotificationPrivacyControls() {
  const [settings, setSettings] = useState<NotificationPrivacySettings>({
    forum_reply_enabled: true,
    forum_mention_enabled: true,
    forum_quote_enabled: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await apiClient.notifications.getPrivacySettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to load notification privacy settings:', error);
      toast.error('Einstellungen konnten nicht geladen werden');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (
    setting: keyof NotificationPrivacySettings,
    value: boolean
  ) => {
    const oldSettings = { ...settings };
    setSettings({ ...settings, [setting]: value });
    setIsSaving(true);

    try {
      await apiClient.notifications.updatePrivacySettings({
        ...settings,
        [setting]: value,
      });
      toast.success('Einstellung gespeichert');
    } catch (error) {
      console.error('Failed to update notification privacy settings:', error);
      toast.error('Fehler beim Speichern');
      setSettings(oldSettings);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-3/4 rounded bg-gray-200"></div>
        <div className="h-3 w-1/2 rounded bg-gray-200"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 flex items-center text-lg font-medium text-gray-900">
          <Bell className="mr-2 h-5 w-5" />
          Forum-Benachrichtigungen
        </h3>
        <p className="mb-6 text-sm text-gray-600">
          Steuere, für welche Forum-Aktivitäten du Benachrichtigungen erhalten
          möchtest.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
          <div className="flex items-start space-x-3">
            <MessageSquare className="mt-0.5 h-5 w-5 text-blue-500" />
            <div>
              <div className="font-medium text-gray-900">
                Antworten auf Threads
              </div>
              <div className="text-sm text-gray-600">
                Benachrichtigung wenn jemand auf deinen Thread antwortet
              </div>
            </div>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={settings.forum_reply_enabled}
              onChange={(e) =>
                handleToggle('forum_reply_enabled', e.target.checked)
              }
              disabled={isSaving}
              className="peer sr-only"
            />
            <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-indigo-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"></div>
          </label>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
          <div className="flex items-start space-x-3">
            <AtSign className="mt-0.5 h-5 w-5 text-green-500" />
            <div>
              <div className="font-medium text-gray-900">Erwähnungen</div>
              <div className="text-sm text-gray-600">
                Benachrichtigung wenn dich jemand in einem Post erwähnt
                (@username)
              </div>
            </div>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={settings.forum_mention_enabled}
              onChange={(e) =>
                handleToggle('forum_mention_enabled', e.target.checked)
              }
              disabled={isSaving}
              className="peer sr-only"
            />
            <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-indigo-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"></div>
          </label>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
          <div className="flex items-start space-x-3">
            <Quote className="mt-0.5 h-5 w-5 text-purple-500" />
            <div>
              <div className="font-medium text-gray-900">Zitate</div>
              <div className="text-sm text-gray-600">
                Benachrichtigung wenn jemand deinen Post zitiert
              </div>
            </div>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={settings.forum_quote_enabled}
              onChange={(e) =>
                handleToggle('forum_quote_enabled', e.target.checked)
              }
              disabled={isSaving}
              className="peer sr-only"
            />
            <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-indigo-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"></div>
          </label>
        </div>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start space-x-3">
          <Bell className="mt-0.5 h-5 w-5 text-blue-600" />
          <div>
            <div className="mb-1 font-medium text-blue-900">Hinweis</div>
            <div className="text-sm text-blue-800">
              Deaktivierte Benachrichtigungen werden nicht mehr erstellt.
              Bereits vorhandene Benachrichtigungen bleiben sichtbar.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
