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
  Bug,
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
          Willkommen auf dem{' '}
          <span className="text-community-600 dark:text-community-400">
            Plätzchen
          </span>
        </h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-xl dark:text-gray-400">
          Eine demokratische Plattform für lokale Gemeinschaften
        </p>
      </div>

      <div className="mx-auto mb-8 max-w-3xl">
        <button
          onClick={() => setShowIntro(!showIntro)}
          className="w-full rounded-lg border border-gray-200 bg-white p-4 text-left transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="mb-1 font-semibold text-gray-900 dark:text-gray-100">
                Über diese Plattform
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {showIntro
                  ? 'Klicke um weniger zu sehen'
                  : 'Erfahre mehr über das Projekt und wie du teilnehmen kannst...'}
              </p>
            </div>
            {showIntro ? (
              <ChevronUp className="ml-4 h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
            ) : (
              <ChevronDown className="ml-4 h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
            )}
          </div>
        </button>

        {showIntro && (
          <div className="mt-4 space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-gray-700 dark:text-gray-300">
              Ein Freund hat meine kläglichen Erklärungsversuche zu Sinn und
              Zweck dieser Plattform mit <em>digitaler Na Dann</em>{' '}
              zusammengefasst. Ich finde, das ist ein charmanter Startpunkt. Ein
              Marktplatz für Ideen, eine Plattform für Begegnungen und Fundament
              für lokale Zusammenarbeit - das war das Ziel, das im digitalen
              Raum ursprünglich durch soziale Netzwerke realisiert werden
              sollte. Manipulative Algorithmen und toxische Kommunikation in
              Abwesenheit vernünftiger Moderation lassen diese Ambition aber
              immer unwahrscheinlicher werden. Das Ziel kommerzieller sozialer
              Netzwerke ist es, uns möglichst lange an den Bildschirm zu
              fesseln. Im Vordergrund steht nicht das Interesse der Nutzerinnen
              und Nutzer, sondern das der Unternehmen, die diese Netzwerke
              betreiben. Dieses Projekt möchte das Gegenteil erreichen.
              Möglichst direkter Informationsaustausch, um echte, sinnvolle
              Interaktion in der analogen Welt zu erleichtern. Eine negative
              Folge herkömmlicher sozialer Netzwerke ist die Bildung und
              Förderung von Filterblasen. Zu einem gewissen Grad ist die Bildung
              von Milieus nachvollziehbar und auch sinnvoll. Gleichgesinnte
              gelangen schneller und effizienter in einen konstruktiven Diskurs.
              Allerdings war es für eine gesunde Gemeinschaft stets von Vorteil,
              wenn ihre Mitglieder zuweilen auch über diesen Tellerrand
              hinausschauten und einen heterogeneren Austausch wagten. In der
              Vergangenheit gelang dies besonders dank Vereinen, religiösen
              Gemeinschaften, politischen Parteien und anderen sozialen
              Organisationen. All diesen ist gemein, dass ihnen der Sprung ins
              digitale Zeitalter vergleichsweise schlecht gelungen ist. Ein
              Nachbarschaftsdienst ist auch heute noch im Interesse der
              Beteiligten und ist oft sinnvoller als der bloße Konsum
              entsprechender Leistungen im Handel. Der Unterschied ist, dass ein
              Klick bei Amazon mittlerweile unendlich viel bequemer ist als
              Alternativen. Das muss aber nicht so sein, solange der soziale,
              digitale Raum nicht zum Selbstzweck verkommt.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Diese erste Testversion umfasst drei einfache Kategorien als
              funktionale Grundlage:
              <br /> <strong>Events</strong> dient der Organisation
              gemeinschaftlicher Aktivitäten. Der Lauftreff kommt genau an dem
              Abend in der Woche zusammen, an dem ich keine Zeit habe? Ich würde
              super gerne die Weltmeisterschaft meiner Lieblingssportart in
              einer Gemeinschaft verfolgen, kenne aber niemanden mit ähnlichem
              Interesse? Wir haben viele Interessierte für ein
              Nachbarschaftsfest, aber keine Plattform, um dieses zu
              organisieren? In solchen Fällen kann dieser Bereich hoffentlich
              eine wachsende Unterstützung bieten.
              <br />
              <strong>Services</strong> sollen Hilfsleistungen und
              Tauschgeschäfte in unserer Gemeinschaft vereinfachen. Es geht
              nicht um einen klassischen Marktplatz oder gar ein zweites
              Shopify. Ohne Frage gibt es Leistungen, die finanziell entlohnt
              werden müssen, soll der Leistende keine Schuld aufnehmen. Im
              Vordergrund soll hier aber keine Marge, sondern der kommunale
              Austausch stehen.
              <br />
              Politische Arbeit wird zunehmend an Parteien und NGOs delegiert.
              Insbesondere auf komunaler Ebene werden dadurch aber viele nicht
              mehr abgeholt. <strong>Civic</strong> soll ein Gegenentwurf für
              diese Entwicklung sein und die Organisation überparteilicher
              Gruppen vereinfachen, um zu lokalen Themen den Diskurs zu suchen.
              Ist eine autofreie Innenstadt in absehbarer Zeit möglich?
              Vielleicht findet sich ein Kreis Interessierter, der mit
              vielfältigem Hintergrund und breitem Blickwinkel genau diese Frage
              diskutiert.
              <br />
              Hinter all diesem steht zusätzlich ein Forum.{' '}
              <strong>Agora</strong> soll einerseits verhindern, dass die oben
              genannten Probleme sozialer Netzwerke sich auch hier
              einschleichen. Die eigentliche Organisation und die Richtung, in
              die sich diese Plattform entwickeln kann, soll hier diskutiert
              werden. Nicht zuletzt dadurch wird deutlich, dass dieses Projekt
              nicht allein durch eine Person getragen werden kann und ehrlich
              gesagt so auch relativ sinnlos wäre. Andererseits soll das Forum
              deswegen auch ein Raum sein, um sich einzubringen. Dazu gehören
              Ideen für konkrete Projekte genauso, wie abstraktere juristische
              oder philosophische Debatten wie eine fortlaufende Dienlichkeit
              der Plattform in Sinne einer Gemeinschaft gewährleistet werden
              kann. Hilfe sowohl bei der technischen Architektur als auch beim
              konkreten Aufbau einer Community für unser digitales Dorf ist mehr
              als willkommen.
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
                className="group block rounded-lg border-2 border-community-200 bg-white p-6 transition-all hover:border-community-400 hover:shadow-lg dark:border-community-800 dark:bg-gray-800 dark:hover:border-community-600"
              >
                <Icon className="mb-4 h-10 w-10 text-community-600 dark:text-community-400" />
                <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground dark:text-gray-400">
                  {feature.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mb-12">
        <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
          <div className="mx-auto max-w-md">
            <Link
              href={secondaryFeature.href}
              className="group block rounded-lg border border-gray-300 bg-gray-50 p-6 transition-all hover:border-gray-400 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600"
            >
              <div className="flex items-center gap-4">
                <MessageSquare className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {secondaryFeature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
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
          className="w-full rounded-lg border-2 border-yellow-300 bg-yellow-50 p-4 text-left transition-all hover:shadow-md dark:border-yellow-700 dark:bg-yellow-950"
        >
          <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center gap-3">
              <Trophy className="h-6 w-6 flex-shrink-0 text-yellow-600 dark:text-yellow-500" />
              <div>
                <h3 className="mb-1 font-semibold text-gray-900 dark:text-gray-100">
                  🐛 Bug Bounty Programm
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {showBugBounty
                    ? 'Klicke um Details zu verbergen'
                    : 'Hilf dabei die Plattform zu verbessern!'}
                </p>
              </div>
            </div>
            {showBugBounty ? (
              <ChevronUp className="ml-4 h-5 w-5 flex-shrink-0 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronDown className="ml-4 h-5 w-5 flex-shrink-0 text-gray-600 dark:text-gray-400" />
            )}
          </div>
        </button>

        {showBugBounty && (
          <div className="mt-4 space-y-6 rounded-lg border-2 border-yellow-300 bg-white p-6 dark:border-yellow-700 dark:bg-gray-800">
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Hilf mit!</strong> Während der Beta-Phase suchen wir
                aktiv nach Bugs, Usability-Problemen und
                Verbesserungsvorschlägen.
              </p>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
                <h4 className="mb-2 font-semibold text-blue-900 dark:text-blue-300">
                  So funktioniert es:
                </h4>
                <ol className="list-inside list-decimal space-y-1 text-sm text-blue-800 dark:text-blue-200">
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
                  <Link href="/forum/threads/6">
                    Zum Bug Bounty Thread im Forum
                  </Link>
                </Button>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
              <h4 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100">
                <Trophy className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
                Bug Hunter Leaderboard
              </h4>
              <AchievementLeaderboard
                achievementType="bug_bounty"
                title="Bug Hunter Leaderboard"
                icon={Bug}
              />
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
