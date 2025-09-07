import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';

function LoginFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="mb-8 text-center">
        <div className="mb-2 h-8 animate-pulse rounded bg-gray-200"></div>
        <div className="mx-auto h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
      </div>
      <div className="space-y-4">
        <div className="h-16 animate-pulse rounded bg-gray-200"></div>
        <div className="h-16 animate-pulse rounded bg-gray-200"></div>
        <div className="h-10 animate-pulse rounded bg-gray-200"></div>
      </div>
    </div>
  );
}

async function LoginPageContent({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  return <LoginForm redirectTo={params.redirect} className="w-full" />;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-md">
        <div className="rounded-lg border border-gray-200 bg-white px-6 py-8 shadow-sm">
          <Suspense fallback={<LoginFormSkeleton />}>
            <LoginPageContent searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
