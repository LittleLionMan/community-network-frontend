import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { apiClient } from '@/lib/api';
import type { Service } from '@/types/service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
} from 'lucide-react';

interface ServiceFormData {
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
}

interface ServiceCreateFormProps {
  onSuccess?: (serviceId: number) => void;
  onCancel?: () => void;
}

interface ApiError extends Error {
  status?: number;
  detail?: {
    error?: string;
    user_message?: string;
    message?: string;
  };
}

interface BackendErrorDetail {
  error?: string;
  user_message?: string;
  reason?: string;
  content_type?: string;
}

export function ServiceCreateForm({
  onSuccess,
  onCancel,
}: ServiceCreateFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [meetingLocations, setMeetingLocations] = useState<string[]>(['']);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<ServiceFormData>({
    defaultValues: {
      title: '',
      description: '',
      is_offering: true,
      meeting_locations: [''],
      price_type: 'free',
      contact_method: 'message',
    },
  });

  const isOffering = watch('is_offering');
  const priceType = watch('price_type');

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

  const onSubmit = async (data: ServiceFormData) => {
    setIsSubmitting(true);

    try {
      const cleanedData = {
        title: data.title.trim(),
        description: data.description.trim(),
        is_offering: data.is_offering,
        service_image: data.service_image,
        meeting_locations: meetingLocations.filter((loc) => loc.trim() !== ''),
        price_type: data.price_type,
        price_amount:
          data.price_amount && data.price_amount > 0
            ? data.price_amount
            : undefined,
        estimated_duration_hours:
          data.estimated_duration_hours && data.estimated_duration_hours > 0
            ? data.estimated_duration_hours
            : undefined,
        contact_method: data.contact_method,
        response_time_hours:
          data.response_time_hours && data.response_time_hours > 0
            ? data.response_time_hours
            : undefined,
      };

      let result: Service;

      if (cleanedData.service_image) {
        const formData = new FormData();
        formData.append('title', cleanedData.title);
        formData.append('description', cleanedData.description);
        formData.append('is_offering', cleanedData.is_offering.toString());
        formData.append('service_image', cleanedData.service_image);

        if (
          cleanedData.meeting_locations &&
          cleanedData.meeting_locations.length > 0
        ) {
          formData.append(
            'meeting_locations',
            JSON.stringify(cleanedData.meeting_locations)
          );
        }

        if (cleanedData.price_amount !== undefined) {
          formData.append('price_amount', cleanedData.price_amount.toString());
        }
        if (cleanedData.estimated_duration_hours !== undefined) {
          formData.append(
            'estimated_duration_hours',
            cleanedData.estimated_duration_hours.toString()
          );
        }
        if (cleanedData.response_time_hours !== undefined) {
          formData.append(
            'response_time_hours',
            cleanedData.response_time_hours.toString()
          );
        }

        formData.append('price_type', cleanedData.price_type);
        formData.append('contact_method', cleanedData.contact_method);

        result = (await apiClient.services.createWithImage(
          formData
        )) as Service;
      } else {
        const serviceData = {
          title: cleanedData.title,
          description: cleanedData.description,
          is_offering: cleanedData.is_offering,
          meeting_locations:
            cleanedData.meeting_locations.length > 0
              ? cleanedData.meeting_locations
              : undefined,
          price_type: cleanedData.price_type,
          price_amount: cleanedData.price_amount,
          estimated_duration_hours: cleanedData.estimated_duration_hours,
          contact_method: cleanedData.contact_method,
          response_time_hours: cleanedData.response_time_hours,
        };

        result = (await apiClient.services.create(serviceData)) as Service;
      }

      toast.success(
        'Service erstellt!',
        'Dein Service wurde erfolgreich erstellt.'
      );

      reset();
      setPreviewImage(null);
      setMeetingLocations(['']);

      if (onSuccess && result?.id) {
        onSuccess(result.id);
      }
    } catch (error) {
      console.error('Create event error:', error);

      if (error instanceof Error) {
        console.log('Error message:', error.message);

        if (error.message.includes('400')) {
          toast.error('Ungültige Daten', 'Bitte überprüfe deine Eingaben.');
        } else if (error.message.includes('401')) {
          toast.error(
            'Nicht angemeldet',
            'Du musst angemeldet sein, um Events zu erstellen.'
          );
        } else {
          toast.error(
            'Fehler beim Erstellen',
            'Bitte versuche es später erneut.'
          );
        }
      } else {
        toast.error(
          'Fehler beim Erstellen',
          'Bitte versuche es später erneut.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Was möchtest du erstellen? *
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setValue('is_offering', true)}
            className={`flex items-center justify-center rounded-lg border-2 p-4 transition-colors ${
              isOffering
                ? 'border-green-500 bg-green-50 text-green-700 dark:border-green-600 dark:bg-green-950 dark:text-green-300'
                : 'border-gray-200 bg-white text-gray-600 hover:border-green-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-green-700'
            }`}
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
            className={`flex items-center justify-center rounded-lg border-2 p-4 transition-colors ${
              !isOffering
                ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-600 dark:bg-blue-950 dark:text-blue-300'
                : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-blue-700'
            }`}
          >
            <Eye className="mr-3 h-6 w-6" />
            <div className="text-left">
              <div className="font-medium">Service suchen</div>
              <div className="text-sm">Ich brauche Hilfe</div>
            </div>
          </button>
        </div>
      </div>

      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
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
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.title.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <Camera className="h-4 w-4" />
          Bild (optional)
        </label>

        {previewImage ? (
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
          <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 dark:border-gray-600">
            <div className="text-center">
              <Upload className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500" />
              <div className="mt-2">
                <label
                  htmlFor="service-image"
                  className="cursor-pointer rounded-md bg-white font-medium text-community-600 hover:text-community-500 dark:bg-gray-800 dark:text-community-400"
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
              <p className="text-xs text-gray-500 dark:text-gray-400">
                PNG, JPG bis zu 5MB
              </p>
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
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
          className="flex w-full resize-none rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-community-500 focus:outline-none focus:ring-2 focus:ring-community-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
          placeholder={
            isOffering
              ? 'Beschreibe deinen Service ausführlich. Was bietest du an? Welche Erfahrung hast du? Was kostet es?'
              : 'Beschreibe, wobei du Hilfe brauchst. Was genau soll gemacht werden? Wann? Welche Vorstellungen hast du?'
          }
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.description.message}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Mindestens 10 Zeichen, maximal 2000 Zeichen
        </p>
      </div>

      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
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
                    ? 'dark:bg-community-950 border-community-500 bg-community-50 text-community-700 dark:border-community-600 dark:text-community-300'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-500'
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
              <span className="text-sm text-gray-500 dark:text-gray-400">
                EUR
              </span>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
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
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Stunden
          </span>
        </div>
        {errors.estimated_duration_hours && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.estimated_duration_hours.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <MapPin className="h-4 w-4" />
          Mögliche Treffpunkte (optional)
        </label>
        <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
          Gib alternative Orte an, wo der Service stattfinden kann. Z.B. bei
          dir, beim anderen, oder an neutralen Orten.
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
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Bevorzugter Kontakt
        </label>
        <select
          {...register('contact_method')}
          className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-community-500 focus:outline-none focus:ring-2 focus:ring-community-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        >
          <option value="message">Nachrichten</option>
          <option value="phone">Telefon</option>
          <option value="email">E-Mail</option>
        </select>
      </div>

      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
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
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Stunden
          </span>
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Wie schnell antwortest du normalerweise auf Anfragen?
        </p>
      </div>

      <div className="flex flex-col gap-3 border-t border-gray-200 pt-6 dark:border-gray-700 sm:flex-row">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Service erstellen...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Service erstellen
            </>
          )}
        </Button>

        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Abbrechen
          </Button>
        )}
      </div>
    </form>
  );
}
