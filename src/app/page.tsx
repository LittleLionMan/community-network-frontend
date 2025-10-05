import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Vote, MessageSquare } from 'lucide-react';

const features = [
  {
    icon: Calendar,
    title: 'Events',
    href: '/events',
    description: 'Community Veranstaltungen',
  },
  {
    icon: Users,
    title: 'Services',
    href: '/services',
    description: 'Angebote & Gesuche',
  },
  {
    icon: Vote,
    title: 'Civic',
    href: '/civic',
    description: 'Bürgerbeteiligung',
  },
  {
    icon: MessageSquare,
    title: 'Meta',
    href: '/forum',
    description: 'App Forum',
  },
];

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold">
          Willkommen im{' '}
          <span className="text-community-600">Community Network</span>
        </h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
          Eine demokratische Plattform für lokale Gemeinschaften. Organisiere
          Events, tausche Services und gestalte deine Gemeinde mit.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link
              key={feature.href}
              href={feature.href}
              className="group block rounded-lg border p-6 transition-all hover:shadow-lg"
            >
              <Icon className="mb-4 h-8 w-8 text-community-600" />
              <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">
                {feature.description}
              </p>
            </Link>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <Button size="lg" asChild>
          <Link href="/auth/register">Jetzt mitmachen</Link>
        </Button>
      </div>
    </div>
  );
}
