'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import {
  Menu,
  User,
  LogOut,
  Settings,
  ChevronDown,
  MessageCircle,
  Shield,
  MessageSquare,
  PocketKnife,
  X,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { useGlobalUnreadCount } from '@/components/providers/UnreadCountProvider';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';

export function Header() {
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { unreadCount } = useGlobalUnreadCount();
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }

      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setShowMobileMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    setShowMobileMenu(false);
    window.location.href = '/';
  };

  const closeMobileMenu = () => {
    setShowMobileMenu(false);
  };

  return (
    <header className="bg-background/95 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <Link className="mr-6 flex items-center space-x-2" href="/">
            <span className="font-bold">Plätzchen</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/events"
              className="font-medium text-community-700 transition-colors hover:text-community-800"
            >
              Events
            </Link>
            <Link
              href="/services"
              className="font-medium text-community-700 transition-colors hover:text-community-800"
            >
              Services
            </Link>
            <Link
              href="/civic"
              className="font-medium text-community-700 transition-colors hover:text-community-800"
            >
              Civic
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <Link
              href="/forum"
              className="text-gray-600 transition-colors hover:text-gray-800"
            >
              Agora
            </Link>
            {isAuthenticated && user?.is_admin && (
              <Link
                href="/admin"
                className="hover:text-foreground/80 flex items-center transition-colors"
              >
                <Shield className="mr-1 h-4 w-4" />
                Admin
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center md:hidden">
          <Link className="flex items-center space-x-2" href="/">
            <span className="font-bold">Plätzchen</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2 md:justify-end">
          {isAuthenticated && user && (
            <div className="flex items-center gap-1 md:hidden">
              <Link href="/messages" className="relative">
                <button className="flex items-center justify-center rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900">
                  <MessageCircle className="h-5 w-5" />
                  {unreadCount.total_unread > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                      {unreadCount.total_unread > 9
                        ? '9+'
                        : unreadCount.total_unread}
                    </span>
                  )}
                </button>
              </Link>

              <NotificationDropdown />
            </div>
          )}

          <Button
            variant="ghost"
            className="md:hidden"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>

          {isLoading ? (
            <div className="hidden items-center gap-2 md:flex">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600"></div>
              <span className="hidden text-sm text-gray-600 sm:inline">
                Überprüfung...
              </span>
            </div>
          ) : isAuthenticated && user ? (
            <div className="hidden items-center gap-2 md:flex">
              <Link href="/messages" className="relative">
                <button className="flex items-center justify-center rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900">
                  <MessageCircle className="h-5 w-5" />
                  {unreadCount.total_unread > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                      {unreadCount.total_unread > 9
                        ? '9+'
                        : unreadCount.total_unread}
                    </span>
                  )}
                </button>
              </Link>

              <NotificationDropdown />

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-gray-100"
                >
                  <ProfileAvatar
                    user={{
                      display_name: user.display_name,
                      profile_image_url: user.profile_image_url,
                    }}
                    size="sm"
                  />
                  <span className="hidden sm:inline">{user.display_name}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 z-50 mt-2 w-48 rounded-md border bg-white py-1 shadow-lg">
                    <div className="border-b px-4 py-2">
                      <div className="font-medium text-gray-900">
                        {user.display_name}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>

                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                      onClick={() => setShowDropdown(false)}
                    >
                      <User className="mr-3 h-4 w-4" />
                      Mein Profil
                    </Link>

                    <Link
                      href="/forum/my/threads"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                      onClick={() => setShowDropdown(false)}
                    >
                      <MessageSquare className="mr-3 h-4 w-4" />
                      Meine Threads
                    </Link>

                    <Link
                      href="/services/my/"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                      onClick={() => setShowDropdown(false)}
                    >
                      <PocketKnife className="mr-3 h-4 w-4" />
                      Meine Services
                    </Link>

                    <Link
                      href="/messages"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                      onClick={() => setShowDropdown(false)}
                    >
                      <MessageCircle className="mr-3 h-4 w-4" />
                      Nachrichten
                      {unreadCount.total_unread > 0 && (
                        <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                          {unreadCount.total_unread > 99
                            ? '99+'
                            : unreadCount.total_unread}
                        </span>
                      )}
                    </Link>

                    <Link
                      href="/profile?tab=settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Settings className="mr-3 h-4 w-4" />
                      Einstellungen
                    </Link>

                    <div className="my-1 border-t"></div>

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      Abmelden
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="hidden gap-2 md:flex">
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

      {showMobileMenu && (
        <div ref={mobileMenuRef} className="border-t bg-white md:hidden">
          <nav className="container flex flex-col space-y-1 py-4">
            <Link
              href="/events"
              className="rounded-md px-4 py-2 text-sm font-medium text-community-700 transition-colors hover:bg-gray-100"
              onClick={closeMobileMenu}
            >
              Events
            </Link>
            <Link
              href="/services"
              className="rounded-md px-4 py-2 text-sm font-medium text-community-700 transition-colors hover:bg-gray-100"
              onClick={closeMobileMenu}
            >
              Services
            </Link>
            <Link
              href="/civic"
              className="rounded-md px-4 py-2 text-sm font-medium text-community-700 transition-colors hover:bg-gray-100"
              onClick={closeMobileMenu}
            >
              Civic
            </Link>
            <Link
              href="/forum"
              className="rounded-md px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100"
              onClick={closeMobileMenu}
            >
              Agora
            </Link>

            {isAuthenticated && user?.is_admin && (
              <Link
                href="/admin"
                className="flex items-center rounded-md px-4 py-2 text-sm transition-colors hover:bg-gray-100"
                onClick={closeMobileMenu}
              >
                <Shield className="mr-2 h-4 w-4" />
                Admin
              </Link>
            )}

            <div className="my-2 border-t"></div>

            {isAuthenticated && user ? (
              <>
                <Link
                  href="/profile"
                  className="flex items-center rounded-md px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                  onClick={closeMobileMenu}
                >
                  <User className="mr-3 h-4 w-4" />
                  Mein Profil
                </Link>

                <Link
                  href="/forum/my/threads"
                  className="flex items-center rounded-md px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                  onClick={closeMobileMenu}
                >
                  <MessageSquare className="mr-3 h-4 w-4" />
                  Meine Threads
                </Link>

                <Link
                  href="/services/my/"
                  className="flex items-center rounded-md px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                  onClick={closeMobileMenu}
                >
                  <PocketKnife className="mr-3 h-4 w-4" />
                  Meine Services
                </Link>

                <Link
                  href="/profile?tab=settings"
                  className="flex items-center rounded-md px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                  onClick={closeMobileMenu}
                >
                  <Settings className="mr-3 h-4 w-4" />
                  Einstellungen
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center rounded-md px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  Abmelden
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 px-4 py-2">
                <Button variant="ghost" size="sm" asChild className="w-full">
                  <Link href="/auth/login" onClick={closeMobileMenu}>
                    Anmelden
                  </Link>
                </Button>
                <Button size="sm" asChild className="w-full">
                  <Link href="/auth/register" onClick={closeMobileMenu}>
                    Registrieren
                  </Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
