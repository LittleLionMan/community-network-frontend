import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/header';
import { QueryProvider } from '@/components/providers/query-provider';
import { GlobalWebSocketProvider } from '@/components/providers/GlobalWebSocketProvider';
import { UnreadCountProvider } from '@/components/providers/UnreadCountProvider';
import { NotificationProvider } from '@/components/providers/NotificationProvider';
import { TokenRefreshProvider } from '@/components/providers/TokenRefreshProvider';
import { ToastProvider } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Plätzchen',
  description: 'Eine demokratische Community-Plattform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const savedTheme = localStorage.getItem('theme');
                  let theme = savedTheme || 'system';

                  document.documentElement.classList.remove('light', 'dark');

                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else if (theme === 'light') {
                    document.documentElement.classList.add('light');
                  } else {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    document.documentElement.classList.add(prefersDark ? 'dark' : 'light');
                  }
                } catch (e) {
                  document.documentElement.classList.add('light');
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={cn(
          'bg-background min-h-screen font-sans antialiased',
          inter.variable
        )}
      >
        <QueryProvider>
          <GlobalWebSocketProvider>
            <UnreadCountProvider>
              <NotificationProvider>
                <div className="relative flex min-h-screen flex-col">
                  <Header />
                  <main className="flex-1">{children}</main>
                  <ToastProvider />
                </div>
                <TokenRefreshProvider />
              </NotificationProvider>
            </UnreadCountProvider>
          </GlobalWebSocketProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
