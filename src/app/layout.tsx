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
