import { formatDistanceToNow, format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { createElement } from 'react';
import {
  MessageSquare,
  Folder,
  Users,
  Lightbulb,
  Settings,
  HelpCircle,
  Bell,
  Trophy,
  Zap,
} from 'lucide-react';

export function formatRelative(dateString: string): string {
  const date = parseISO(dateString);
  return formatDistanceToNow(date, {
    addSuffix: true,
    locale: de,
  });
}

export function formatAbsolute(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, 'dd.MM.yyyy HH:mm', { locale: de });
}

interface DynamicIconProps {
  name?: string;
  className?: string;
}

const iconMap = {
  MessageSquare,
  Folder,
  Users,
  Lightbulb,
  Settings,
  HelpCircle,
  Bell,
  Trophy,
  Zap,
};

export function DynamicIcon({
  name = 'MessageSquare',
  className,
}: DynamicIconProps) {
  const IconComponent = iconMap[name as keyof typeof iconMap] || MessageSquare;
  return createElement(IconComponent, { className });
}

export function getContrastColor(
  hexColor: string
): 'text-white' | 'text-black' {
  if (!hexColor || hexColor.length !== 7) return 'text-white';

  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? 'text-black' : 'text-white';
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
