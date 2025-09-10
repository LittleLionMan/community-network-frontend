'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Shield,
  Users,
  MessageSquare,
  ChevronLeft,
  Menu,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    description: 'Platform Übersicht & Statistiken',
  },
  {
    name: 'Security',
    href: '/admin/security',
    icon: Shield,
    description: 'Security Monitoring & Rate Limiting',
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users,
    description: 'User Management & Rate Limits',
  },
  {
    name: 'Content',
    href: '/admin/content',
    icon: MessageSquare,
    description: 'Content Moderation',
  },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentPage =
    navigation.find((item) => item.href === pathname) || navigation[0];

  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-indigo-600" />
            <span className="ml-2 text-lg font-bold text-gray-900">Admin</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      isActive
                        ? 'text-indigo-500'
                        : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  <div className="flex-1">
                    <div>{item.name}</div>
                    <div
                      className={`text-xs ${
                        isActive ? 'text-indigo-500' : 'text-gray-400'
                      }`}
                    >
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
              <span className="text-xs font-medium text-indigo-600">
                {user?.display_name?.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">
                {user?.display_name}
              </p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
          <Link
            href="/"
            className="mt-3 flex items-center text-xs text-gray-500 hover:text-gray-700"
          >
            <ChevronLeft className="mr-1 h-3 w-3" />
            Zurück zur Community
          </Link>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="border-b border-gray-200 bg-white shadow-sm">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="mr-4 lg:hidden"
              >
                <Menu className="h-6 w-6 text-gray-600" />
              </button>

              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {currentPage.name}
                </h1>
                <p className="text-sm text-gray-500">
                  {currentPage.description}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="hidden items-center text-sm text-gray-500 hover:text-gray-700 sm:flex"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Community
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
