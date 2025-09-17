'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useServiceMutations } from '@/hooks/useServices';
import { toast } from '@/components/ui/toast';
import {
  FileText,
  Save,
  RefreshCw,
  Upload,
  X,
  MapPin,
  Plus,
  HandHeart,
  Eye,
  Camera,
  Euro,
  Clock,
  MessageCircle,
  Trash2,
} from 'lucide-react';
import type { Service, ServiceUpdateData } from '@/types/service';

interface ServiceEditFormData {
  title: string;
  description: string;
  is_offering: boolean;
  service_image?: File;
  meeting_locations: string[];
  price_type: 'free' | 'paid' | 'negotiable' | 'exchange';
  price_amount?: number;
  estimated_duration_hours?: number;
  contact_method: 'message' | 'phone' | 'email';
  response_time_hours?: number;
  is_active: boolean;
}

interface ServiceEditFormProps {
  service: Service;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ServiceEditForm({
  service,
  onSuccess,
  onCancel,
}: ServiceEditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(
    service.service_image_url || null
  );
  const [meetingLocations, setMeetingLocations] = useState<string[]>(
    service.meeting_locations && service.meeting_locations.length > 0
      ? service.meeting_locations
      : ['']
  );
  const [imageDeleted, setImageDeleted] = useState(false);

  const { updateService } = useServiceMutations();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    setValue,
    reset,
  } = useForm<ServiceEditFormData>({
    defaultValues: {
      title: service.title,
      description: service.description,
      is_offering: service.is_offering,
      meeting_locations: service.meeting_locations || [''],
      price_type: service.price_type || 'free',
      price_amount: service.price_amount || undefined,
      estimated_duration_hours: service.estimated_duration_hours || undefined,
      contact_method: service.contact_method,
      response_time_hours: service.response_time_hours || undefined,
      is_active: service.is_active,
    },
  });

  const isOffering = watch('is_offering');
  const priceType = watch('price_type');
  const isActive = watch('is_active');
  const hasInterests = service.interest_count > 0;

  const handleImageChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error('Datei zu groß', 'Das Bild darf maximal 5MB groß sein.');
          return;
        }

        if (!file.type.startsWith('image/')) {
          toast.error('Ungültiger Dateityp', 'Bitte wähle eine Bilddatei aus.');
          return;
        }

        setValue('service_image', file);
        setImageDeleted(false);

        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [setValue]
  );

  const removeImage = useCallback(() => {
    setValue('service_image', undefined);
    setPreviewImage(null);
    setImageDeleted(true);
  }, [setValue]);

  const addMeetingLocation = useCallback(() => {
    setMeetingLocations((prev) => [...prev, '']);
  }, []);

  const removeMeetingLocation = useCallback((index: number) => {
    setMeetingLocations((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateMeetingLocation = useCallback((index: number, value: string) => {
    setMeetingLocations((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  }, []);

  const priceOptions = [
    { value: 'free' as const, label: 'Kostenlos' },
    { value: 'paid' as const, label: 'Bezahlt' },
    { value: 'negotiable' as const, label: 'Verhandelbar' },
    { value: 'exchange' as const, label: 'Tausch' },
  ];

  const contactOptions = [
    { value: 'message' as const, label: 'Nachrichten' },
    { value: 'phone' as const, label: 'Telefon' },
    { value: 'email' as const, label: 'E-Mail' },
  ];

  const onSubmit = async (data: ServiceEditFormData) => {
    setIsSubmitting(true);

    try {
      // Clean numeric fields - convert empty strings to undefined
      const cleanPrice =
        data.price_amount && data.price_amount > 0
          ? data.price_amount
          : undefined;
      const cleanDuration =
        data.estimated_duration_hours && data.estimated_duration_hours > 0
          ? data.estimated_duration_hours
          : undefined;
      const cleanResponseTime =
        data.response_time_hours && data.response_time_hours > 0
          ? data.response_time_hours
          : undefined;

      const updateData: ServiceUpdateData = {
        title: data.title.trim(),
        description: data.description.trim(),
        is_offering: data.is_offering,
        meeting_locations: meetingLocations.filter((loc) => loc.trim() !== ''),
        price_type: data.price_type,
        price_amount: cleanPrice,
        estimated_duration_hours: cleanDuration,
        contact_method: data.contact_method,
        response_time_hours: cleanResponseTime,
        is_active: data.is_active,
      };

      // Handle image upload/deletion
      if (data.service_image) {
        updateData.service_image = data.service_image;
      } else if (imageDeleted && service.service_image_url) {
        updateData.service_image = null;
      }

      await updateService(service.id, updateData);

      toast.success(
        'Service aktualisiert!',
        'Die Änderungen wurden erfolgreich gespeichert.'
      );

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Update service error:', error);

      if (error instanceof Error) {
        if (error.message.includes('400')) {
          toast.error('Ungültige Daten', 'Bitte überprüfe deine Eingaben.');
        } else if (error.message.includes('401')) {
          toast.error(
            'Nicht berechtigt',
            'Du bist nicht berechtigt, diesen Service zu bearbeiten.'
          );
        } else if (error.message.includes('403')) {
          toast.error(
            'Aktion nicht erlaubt',
            'Der Service kann nicht mehr bearbeitet werden.'
          );
        } else {
          toast.error(
            'Fehler beim Speichern',
            'Bitte versuche es später erneut.'
          );
        }
      } else {
        toast.error(
          'Fehler beim Speichern',
          'Bitte versuche es später erneut.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    reset();
    setPreviewImage(service.service_image_url || null);
    setMeetingLocations(
      service.meeting_locations && service.meeting_locations.length > 0
        ? service.meeting_locations
        : ['']
    );
    setImageDeleted(false);
    toast.success('Zurückgesetzt', 'Alle Änderungen wurden verworfen.');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="mb-3 block text-sm font-medium text-gray-700">
          Service Typ *
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setValue('is_offering', true)}
            disabled={hasInterests}
            className={`flex items-center justify-center rounded-lg border-2 p-4 transition-colors ${
              isOffering
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-green-300'
            } ${hasInterests ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <HandHeart className="mr-3 h-6 w-6" />
            <div className="text-left">
              <div className="font-medium">Service anbieten</div>
              <div className="text-sm">Ich kann etwas anbieten</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setValue('is_offering', false)}
            disabled={hasInterests}
            className={`flex items-center justify-center rounded-lg border-2 p-4 transition-colors ${
              !isOffering
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300'
            } ${hasInterests ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <Eye className="mr-3 h-6 w-6" />
            <div className="text-left">
              <div className="font-medium">Service suchen</div>
              <div className="text-sm">Ich brauche Hilfe</div>
            </div>
          </button>
        </div>
        {hasInterests && (
          <p className="mt-2 text-xs text-yellow-600">
            ⚠️ Service-Typ kann nicht geändert werden, da bereits Interessenten
            vorhanden sind.
          </p>
        )}
      </div>

      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
          <FileText className="h-4 w-4" />
          Titel *
        </label>
        <Input
          {...register('title', {
            required: 'Titel ist erforderlich',
            minLength: {
              value: 1,
              message: 'Titel muss mindestens 1 Zeichen lang sein',
            },
            maxLength: {
              value: 100,
              message: 'Titel darf maximal 100 Zeichen lang sein',
            },
          })}
          placeholder={
            isOffering
              ? 'z.B. Gartenarbeit, Nachhilfe, Handwerk...'
              : 'z.B. Suche Babysitter, brauche Umzugshilfe...'
          }
          error={!!errors.title}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
          <Camera className="h-4 w-4" />
          Bild (optional)
        </label>

        {previewImage && !imageDeleted ? (
          <div className="relative">
            <img
              src={previewImage}
              alt="Service preview"
              className="h-48 w-full rounded-lg object-cover"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6">
            <div className="text-center">
              <Upload className="mx-auto h-8 w-8 text-gray-400" />
              <div className="mt-2">
                <label
                  htmlFor="service-image"
                  className="cursor-pointer rounded-md bg-white font-medium text-community-600 hover:text-community-500"
                >
                  Bild hochladen
                </label>
                <input
                  id="service-image"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleImageChange}
                />
              </div>
              <p className="text-xs text-gray-500">PNG, JPG bis zu 5MB</p>
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
          <FileText className="h-4 w-4" />
          Beschreibung *
        </label>
        <textarea
          {...register('description', {
            required: 'Beschreibung ist erforderlich',
            minLength: {
              value: 10,
              message: 'Beschreibung muss mindestens 10 Zeichen lang sein',
            },
            maxLength: {
              value: 2000,
              message: 'Beschreibung darf maximal 2000 Zeichen lang sein',
            },
          })}
          rows={6}
          className="bg-background flex w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-community-500 focus:outline-none focus:ring-2 focus:ring-community-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder={
            isOffering
              ? 'Beschreibe deinen Service ausführlich. Was bietest du an? Welche Erfahrung hast du? Was kostet es?'
              : 'Beschreibe, wobei du Hilfe brauchst. Was genau soll gemacht werden? Wann? Welche Vorstellungen hast du?'
          }
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description.message}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Mindestens 10 Zeichen, maximal 2000 Zeichen
        </p>
      </div>

      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
          <Euro className="h-4 w-4" />
          Preis (optional)
        </label>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {priceOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setValue('price_type', option.value)}
                className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                  priceType === option.value
                    ? 'border-community-500 bg-community-50 text-community-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {priceType === 'paid' && (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="Preis"
                {...register('price_amount', {
                  min: { value: 0, message: 'Preis muss positiv sein' },
                })}
                className="w-32"
              />
              <span className="text-sm text-gray-500">EUR</span>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
          <Clock className="h-4 w-4" />
          Geschätzte Dauer (optional)
        </label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="0.25"
            step="0.25"
            placeholder="Dauer"
            {...register('estimated_duration_hours', {
              min: { value: 0.25, message: 'Mindestens 15 Minuten' },
              max: { value: 168, message: 'Maximal 1 Woche' },
            })}
            className="w-32"
          />
          <span className="text-sm text-gray-500">Stunden</span>
        </div>
        {errors.estimated_duration_hours && (
          <p className="mt-1 text-sm text-red-600">
            {errors.estimated_duration_hours.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
          <MapPin className="h-4 w-4" />
          Mögliche Treffpunkte (optional)
        </label>
        <p className="mb-3 text-sm text-gray-600">
          Gib alternative Orte an, wo der Service stattfinden kann.
        </p>

        <div className="space-y-3">
          {meetingLocations.map((location, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={location}
                onChange={(e) => updateMeetingLocation(index, e.target.value)}
                placeholder={`Treffpunkt ${index + 1} (z.B. "Bei mir zuhause", "Stadtpark", "Online")`}
                className="flex-1"
              />
              {meetingLocations.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeMeetingLocation(index)}
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {meetingLocations.length < 5 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addMeetingLocation}
            className="mt-3 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Weiteren Treffpunkt hinzufügen
          </Button>
        )}
      </div>

      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
          <MessageCircle className="h-4 w-4" />
          Bevorzugter Kontakt
        </label>
        <div className="grid grid-cols-3 gap-2">
          {contactOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setValue('contact_method', option.value)}
              className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                watch('contact_method') === option.value
                  ? 'border-community-500 bg-community-50 text-community-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
          <Clock className="h-4 w-4" />
          Antwortzeit (optional)
        </label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="1"
            max="168"
            placeholder="Antwortzeit"
            {...register('response_time_hours', {
              min: { value: 1, message: 'Mindestens 1 Stunde' },
              max: { value: 168, message: 'Maximal 1 Woche' },
            })}
            className="w-32"
          />
          <span className="text-sm text-gray-500">Stunden</span>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Wie schnell antwortest du normalerweise auf Anfragen?
        </p>
      </div>

      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
          Service Status
        </label>
        <div className="flex items-center">
          <input
            type="checkbox"
            {...register('is_active')}
            className="mr-2 h-4 w-4 rounded border-gray-300 text-community-600 focus:ring-community-500"
          />
          <span className="text-sm text-gray-700">
            Service ist aktiv und sichtbar für andere
          </span>
        </div>
        {!isActive && (
          <p className="mt-1 text-xs text-yellow-600">
            Deaktivierte Services sind für andere Nutzer nicht sichtbar.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:justify-between">
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Speichern...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Änderungen speichern
              </>
            )}
          </Button>

          {isDirty && (
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Zurücksetzen
            </Button>
          )}
        </div>

        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Abbrechen
          </Button>
        )}
      </div>

      {!isDirty && (
        <div className="rounded-lg bg-blue-50 p-4">
          <p className="text-sm text-blue-700">
            ✓ Alle Änderungen wurden gespeichert. Du kannst weitere Anpassungen
            vornehmen oder zur Service-Ansicht zurückkehren.
          </p>
        </div>
      )}
    </form>
  );
}
