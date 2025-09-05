import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'E-Mail ist erforderlich')
    .email('Ungültige E-Mail-Adresse'),
  password: z.string().min(1, 'Passwort ist erforderlich'),
  rememberMe: z.boolean(),
});

export const registerStep1Schema = z.object({
  displayName: z
    .string()
    .min(2, 'Display Name muss mindestens 2 Zeichen haben')
    .max(20, 'Display Name darf maximal 20 Zeichen haben')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Nur Buchstaben, Zahlen, _ und - erlaubt'),
  email: z
    .string()
    .min(1, 'E-Mail ist erforderlich')
    .email('Ungültige E-Mail-Adresse'),
});

export const registerStep2Schema = z
  .object({
    password: z
      .string()
      .min(8, 'Passwort muss mindestens 8 Zeichen haben')
      .regex(/\d/, 'Passwort muss mindestens eine Zahl enthalten')
      .regex(/[A-Z]/, 'Passwort muss mindestens einen Großbuchstaben enthalten')
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        'Passwort muss mindestens ein Sonderzeichen enthalten'
      ),
    confirmPassword: z.string().min(1, 'Passwort bestätigen ist erforderlich'),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwörter stimmen nicht überein',
    path: ['confirmPassword'],
  });

export const registerSchema = registerStep1Schema.merge(registerStep2Schema);

export const passwordResetSchema = z.object({
  email: z
    .string()
    .min(1, 'E-Mail ist erforderlich')
    .email('Ungültige E-Mail-Adresse'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterStep1Data = z.infer<typeof registerStep1Schema>;
export type RegisterStep2Data = z.infer<typeof registerStep2Schema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type PasswordResetData = z.infer<typeof passwordResetSchema>;

export const passwordCriteria = [
  {
    key: 'length',
    label: 'Mindestens 8 Zeichen',
    test: (password: string) => password.length >= 8,
  },
  {
    key: 'number',
    label: 'Eine Zahl (0-9)',
    test: (password: string) => /\d/.test(password),
  },
  {
    key: 'uppercase',
    label: 'Ein Großbuchstabe (A-Z)',
    test: (password: string) => /[A-Z]/.test(password),
  },
  {
    key: 'special',
    label: 'Ein Sonderzeichen (!@#$%...)',
    test: (password: string) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
  },
] as const;
