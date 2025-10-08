'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Users,
  Vote,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Trophy,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { AchievementLeaderboard } from '@/components/achievements/Leaderboard';

const mainFeatures = [
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
];

const secondaryFeature = {
  icon: MessageSquare,
  title: 'Agora',
  href: '/forum',
  description: 'App Forum',
};

export default function HomePage() {
  const [showIntro, setShowIntro] = useState(false);
  const [showBugBounty, setShowBugBounty] = useState(false);
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold">
          Willkommen im{' '}
          <span className="text-community-600">Community Network</span>
        </h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
          Eine demokratische Plattform für lokale Gemeinschaften
        </p>
      </div>

      <div className="mx-auto mb-8 max-w-3xl">
        <button
          onClick={() => setShowIntro(!showIntro)}
          className="w-full rounded-lg border border-gray-200 bg-white p-4 text-left transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="mb-1 font-semibold text-gray-900">
                Über diese Plattform
              </h3>
              <p className="text-sm text-gray-600">
                {showIntro
                  ? 'Klicke um weniger zu sehen'
                  : 'Erfahre mehr über das Community Network und wie du teilnehmen kannst...'}
              </p>
            </div>
            {showIntro ? (
              <ChevronUp className="ml-4 h-5 w-5 flex-shrink-0 text-gray-400" />
            ) : (
              <ChevronDown className="ml-4 h-5 w-5 flex-shrink-0 text-gray-400" />
            )}
          </div>
        </button>

        {showIntro && (
          <div className="mt-4 space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-6">
            <p className="text-gray-700">
              Das Community Network ist eine demokratische Plattform, die lokale
              Gemeinschaften dabei unterstützt, sich zu organisieren, Ressourcen
              zu teilen und gemeinsam Entscheidungen zu treffen.
            </p>
            <p className="text-gray-700">
              <strong>Events</strong> helfen dir, lokale Veranstaltungen zu
              organisieren und daran teilzunehmen.
              <strong> Services</strong> ermöglichen den Austausch von
              Fähigkeiten und Ressourcen innerhalb der Community.{' '}
              <strong>Civic</strong> bietet Raum für demokratische Beteiligung
              und politische Diskussionen.
            </p>
            <p className="text-gray-700">
              Das <strong>Agora Forum</strong> ist der zentrale Ort für
              Diskussionen über die Weiterentwicklung der Plattform selbst –
              hier können alle Mitglieder Ideen einbringen, Features vorschlagen
              und über die Zukunft der Community mitentscheiden.
            </p>
          </div>
        )}
      </div>

      <div className="mb-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {mainFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.href}
                href={feature.href}
                className="group block rounded-lg border-2 border-community-200 bg-white p-6 transition-all hover:border-community-400 hover:shadow-lg"
              >
                <Icon className="mb-4 h-10 w-10 text-community-600" />
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mb-12">
        <div className="border-t border-gray-200 pt-6">
          <div className="mx-auto max-w-md">
            <Link
              href={secondaryFeature.href}
              className="group block rounded-lg border border-gray-300 bg-gray-50 p-6 transition-all hover:border-gray-400 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <MessageSquare className="h-8 w-8 text-gray-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {secondaryFeature.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {secondaryFeature.description}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto mb-12 max-w-4xl">
        <button
          onClick={() => setShowBugBounty(!showBugBounty)}
          className="w-full rounded-lg border-2 border-yellow-300 bg-yellow-50 p-4 text-left transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center gap-3">
              <Trophy className="h-6 w-6 flex-shrink-0 text-yellow-600" />
              <div>
                <h3 className="mb-1 font-semibold text-gray-900">
                  🐛 Bug Bounty Programm
                </h3>
                <p className="text-sm text-gray-700">
                  {showBugBounty
                    ? 'Klicke um Details zu verbergen'
                    : 'Hilf uns die Plattform zu verbessern und werde belohnt!'}
                </p>
              </div>
            </div>
            {showBugBounty ? (
              <ChevronUp className="ml-4 h-5 w-5 flex-shrink-0 text-gray-600" />
            ) : (
              <ChevronDown className="ml-4 h-5 w-5 flex-shrink-0 text-gray-600" />
            )}
          </div>
        </button>

        {showBugBounty && (
          <div className="mt-4 space-y-6 rounded-lg border-2 border-yellow-300 bg-white p-6">
            <div className="space-y-4">
              <p className="text-gray-700">
                <strong>Wir brauchen deine Hilfe!</strong> Während der
                Beta-Phase suchen wir aktiv nach Bugs, Usability-Problemen und
                Verbesserungsvorschlägen.
              </p>
              <p className="text-gray-700">
                Für jeden bestätigten Bug-Report gibt es ein{' '}
                <strong>Kaltgetränk deiner Wahl</strong> 🍺🥤
              </p>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h4 className="mb-2 font-semibold text-blue-900">
                  So funktioniert's:
                </h4>
                <ol className="list-inside list-decimal space-y-1 text-sm text-blue-800">
                  <li>Finde einen Bug oder ein Problem auf der Plattform</li>
                  <li>
                    Poste eine detaillierte Beschreibung im Bug Bounty Thread im
                    Agora Forum
                  </li>
                  <li>Warte auf die Bestätigung durch einen Admin</li>
                  <li>Sobald bestätigt, erscheinst du hier im Leaderboard</li>
                </ol>
              </div>
              <div className="flex justify-center">
                <Button asChild>
                  <Link href="/forum/threads/1">
                    Zum Bug Bounty Thread im Forum
                  </Link>
                </Button>
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                <Trophy className="h-5 w-5 text-yellow-600" />
                Bug Hunter Leaderboard
              </h4>
              <AchievementLeaderboard />
            </div>
          </div>
        )}
      </div>

      {!isAuthenticated && (
        <div className="text-center">
          <Button size="lg" asChild>
            <Link href="/auth/register">Jetzt mitmachen</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
