import { z } from 'zod';

export const messageContentSchema = z.object({
  content: z
    .string()
    .min(1, 'Nachricht darf nicht leer sein')
    .max(4000, 'Nachricht darf maximal 4000 Zeichen haben')
    .refine(
      (content) => content.trim().length > 0,
      'Nachricht darf nicht nur aus Leerzeichen bestehen'
    ),
  reply_to_id: z.number().optional(),
});

export const createConversationSchema = z.object({
  participant_id: z.number().positive('Ungültige Teilnehmer-ID'),
  initial_message: z
    .string()
    .min(1, 'Erste Nachricht ist erforderlich')
    .max(4000, 'Nachricht darf maximal 4000 Zeichen haben'),
});

export function sanitizeMessageContent(content: string): string {
  return content
    .trim()
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .slice(0, 4000);
}

export class MessageRateLimit {
  private static instances: Map<number, MessageRateLimit> = new Map();
  private timestamps: number[] = [];
  private readonly maxMessages: number;
  private readonly timeWindow: number; // in milliseconds

  private constructor(maxMessages: number = 30, timeWindowMinutes: number = 1) {
    this.maxMessages = maxMessages;
    this.timeWindow = timeWindowMinutes * 60 * 1000;
  }

  static getInstance(userId: number): MessageRateLimit {
    if (!this.instances.has(userId)) {
      this.instances.set(userId, new MessageRateLimit());
    }
    return this.instances.get(userId)!;
  }

  canSendMessage(): boolean {
    const now = Date.now();

    this.timestamps = this.timestamps.filter(
      (timestamp) => now - timestamp < this.timeWindow
    );

    if (this.timestamps.length >= this.maxMessages) {
      return false;
    }

    this.timestamps.push(now);
    return true;
  }

  getRemainingTime(): number {
    if (this.timestamps.length < this.maxMessages) {
      return 0;
    }

    const oldestTimestamp = Math.min(...this.timestamps);
    const timeRemaining = this.timeWindow - (Date.now() - oldestTimestamp);
    return Math.max(0, timeRemaining);
  }
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedContent?: string;
}

export function validateMessageContent(content: string): ValidationResult {
  try {
    const result = messageContentSchema.parse({ content });
    const sanitizedContent = sanitizeMessageContent(result.content);

    return {
      isValid: true,
      sanitizedContent,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        error: error.issues[0]?.message,
      };
    }

    return {
      isValid: false,
      error: 'Unbekannter Validierungsfehler',
    };
  }
}
