import { Suspense } from 'react';
import { RegisterForm } from '@/components/auth/RegisterForm';

function RegisterFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="mb-8 text-center">
        <div className="mb-2 h-8 animate-pulse rounded bg-gray-200"></div>
        <div className="mx-auto h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
      </div>
      <div className="mb-8">
        <div className="mb-2 h-4 animate-pulse rounded bg-gray-200"></div>
        <div className="h-2 animate-pulse rounded-full bg-gray-200"></div>
      </div>
      <div className="space-y-4">
        <div className="h-16 animate-pulse rounded bg-gray-200"></div>
        <div className="h-16 animate-pulse rounded bg-gray-200"></div>
        <div className="h-10 animate-pulse rounded bg-gray-200"></div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-md">
        <div className="rounded-lg border border-gray-200 bg-white px-6 py-8 shadow-sm">
          <Suspense fallback={<RegisterFormSkeleton />}>
            <RegisterForm className="w-full" />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
