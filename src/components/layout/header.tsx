'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth'
import { Menu, User, LogOut } from 'lucide-react'

export function Header() {
  const { user, isAuthenticated, logout } = useAuthStore()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <Link className="mr-6 flex items-center space-x-2" href="/">
            <span className="font-bold">Community Network</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/events" className="transition-colors hover:text-foreground/80">
              Events
            </Link>
            <Link href="/services" className="transition-colors hover:text-foreground/80">
              Services
            </Link>
            <Link href="/civic" className="transition-colors hover:text-foreground/80">
              Civic
            </Link>
            <Link href="/meta" className="transition-colors hover:text-foreground/80">
              Meta
            </Link>
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <Button variant="ghost" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm">{user.display_name}</span>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">Anmelden</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/register">Registrieren</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
