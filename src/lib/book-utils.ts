const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function getBookCoverUrl(url?: string | null): string | null {
  if (!url) {
    return null;
  }

  if (url.startsWith('/uploads/')) {
    return `${API_BASE_URL}${url}`;
  }

  return url;
}

export const CONDITION_LABELS = {
  new: 'Neu',
  like_new: 'Wie neu',
  good: 'Gut',
  acceptable: 'Akzeptabel',
} as const;

export const LANGUAGE_LABELS = {
  de: 'Deutsch',
  en: 'Englisch',
  fr: 'Französisch',
  es: 'Spanisch',
  it: 'Italienisch',
  nl: 'Niederländisch',
  pt: 'Portugiesisch',
  ru: 'Russisch',
  zh: 'Chinesisch',
  ja: 'Japanisch',
} as const;
