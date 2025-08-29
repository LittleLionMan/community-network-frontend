import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Calendar, Users, Vote, MessageSquare } from 'lucide-react'

const features = [
  { icon: Calendar, title: 'Events', href: '/events', description: 'Community Veranstaltungen' },
  { icon: Users, title: 'Services', href: '/services', description: 'Angebote & Gesuche' },
  { icon: Vote, title: 'Civic', href: '/civic', description: 'Bürgerbeteiligung' },
  { icon: MessageSquare, title: 'Meta', href: '/meta', description: 'App Forum' },
]

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Willkommen im <span className="text-community-600">Community Network</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Eine demokratische Plattform für lokale Gemeinschaften.
          Organisiere Events, tausche Services und gestalte deine Gemeinde mit.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <Link
              key={feature.href}
              href={feature.href}
              className="group block p-6 border rounded-lg hover:shadow-lg transition-all"
            >
              <Icon className="w-8 h-8 text-community-600 mb-4" />
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </Link>
          )
        })}
      </div>

      <div className="text-center mt-12">
        <Button size="lg" asChild>
          <Link href="/auth/register">Jetzt mitmachen</Link>
        </Button>
      </div>
    </div>
  )
}
