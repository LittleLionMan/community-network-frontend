'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import { Menu, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';

export function Header() {
  const { user, isAuthenticated, isLoading, logout, validateToken } =
    useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isAuthenticated && !isLoading) {
      validateToken();
    }

    if (isAuthenticated) {
      interval = setInterval(
        () => {
          if (!isLoading) {
            validateToken();
          }
        },
        10 * 60 * 1000
      );
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  useEffect(() => {
    let focusTimeout: NodeJS.Timeout | null = null;

    const handleFocus = () => {
      if (focusTimeout) clearTimeout(focusTimeout);

      focusTimeout = setTimeout(() => {
        if (isAuthenticated && !isLoading) {
          validateToken();
        }
      }, 1000);
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
      if (focusTimeout) {
        clearTimeout(focusTimeout);
      }
    };
  }, [isAuthenticated, isLoading, validateToken]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
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
    window.location.href = '/';
  };

  return (
    <header className="bg-background/95 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <Link className="mr-6 flex items-center space-x-2" href="/">
            <span className="font-bold">Community Network</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/events"
              className="hover:text-foreground/80 transition-colors"
            >
              Events
            </Link>
            <Link
              href="/services"
              className="hover:text-foreground/80 transition-colors"
            >
              Services
            </Link>
            <Link
              href="/civic"
              className="hover:text-foreground/80 transition-colors"
            >
              Civic
            </Link>
            <Link
              href="/meta"
              className="hover:text-foreground/80 transition-colors"
            >
              Meta
            </Link>
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <Button variant="ghost" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>

          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600"></div>
              <span className="hidden text-sm text-gray-600 sm:inline">
                Überprüfung...
              </span>
            </div>
          ) : isAuthenticated && user ? (
            <div className="flex items-center gap-2">
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
  );
}
