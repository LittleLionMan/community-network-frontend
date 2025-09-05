import { z } from 'zod';

export const profileUpdateSchema = z.object({
  display_name: z
    .string()
    .min(2, 'Display Name muss mindestens 2 Zeichen haben')
    .max(20, 'Display Name darf maximal 20 Zeichen haben')
    .optional(),

  first_name: z
    .string()
    .max(100, 'Vorname darf maximal 100 Zeichen haben')
    .optional(),

  last_name: z
    .string()
    .max(100, 'Nachname darf maximal 100 Zeichen haben')
    .optional(),

  bio: z.string().max(1000, 'Bio darf maximal 1000 Zeichen haben').optional(),

  location: z
    .string()
    .max(200, 'Standort darf maximal 200 Zeichen haben')
    .optional(),
});

export const privacyUpdateSchema = z.object({
  email_private: z.boolean().optional(),
  first_name_private: z.boolean().optional(),
  last_name_private: z.boolean().optional(),
  bio_private: z.boolean().optional(),
  location_private: z.boolean().optional(),
  created_at_private: z.boolean().optional(),
});

export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;
export type PrivacyUpdateData = z.infer<typeof privacyUpdateSchema>;
