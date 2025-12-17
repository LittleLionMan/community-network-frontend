'use client';

import { Check } from 'lucide-react';
import type { User } from '@/types';

interface ProfileCompletionProps {
  user: User;
}

export function ProfileCompletion({ user }: ProfileCompletionProps) {
  const completionItems = [
    {
      field: 'display_name',
      label: 'Display Name',
      completed: !!user.display_name,
      required: true,
    },
    {
      field: 'email_verified',
      label: 'Email bestätigt',
      completed: user.email_verified,
      required: true,
    },
    { field: 'bio', label: 'Bio', completed: !!user.bio, required: false },
    {
      field: 'location',
      label: 'Standort',
      completed: !!user.exact_address,
      required: false,
    },
    {
      field: 'first_name',
      label: 'Vollständiger Name',
      completed: !!(user.first_name && user.last_name),
      required: false,
    },
  ];

  const totalCompleted = completionItems.filter(
    (item) => item.completed
  ).length;
  const completionPercentage = Math.round(
    (totalCompleted / completionItems.length) * 100
  );

  const getCompletionLevel = () => {
    if (completionPercentage >= 80)
      return {
        level: 'Vollständig',
        color: 'text-green-600 dark:text-green-400',
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-800',
      };
    if (completionPercentage >= 60)
      return {
        level: 'Gut',
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
      };
    if (completionPercentage >= 40)
      return {
        level: 'Grundlegend',
        color: 'text-yellow-600 dark:text-yellow-400',
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        border: 'border-yellow-200 dark:border-yellow-800',
      };
    return {
      level: 'Unvollständig',
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
    };
  };

  const status = getCompletionLevel();

  return (
    <div className={`${status.bg} rounded-lg border ${status.border} p-4`}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-medium text-gray-900 dark:text-gray-100">
          Profil-Vollständigkeit
        </h3>
        <div className="text-right">
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {completionPercentage}%
          </div>
          <div className={`text-xs ${status.color} font-medium`}>
            {status.level}
          </div>
        </div>
      </div>

      <div className="mb-4 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className="h-2 rounded-full bg-indigo-600 transition-all duration-300 dark:bg-indigo-500"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>

      <div className="space-y-2">
        {completionItems.map((item) => (
          <div key={item.field} className="flex items-center text-sm">
            {item.completed ? (
              <Check className="mr-2 h-4 w-4 flex-shrink-0 text-green-500 dark:text-green-400" />
            ) : (
              <div className="mr-2 h-4 w-4 flex-shrink-0 rounded border border-gray-300 dark:border-gray-600" />
            )}
            <span
              className={
                item.completed
                  ? 'text-gray-700 dark:text-gray-300'
                  : 'text-gray-500 dark:text-gray-400'
              }
            >
              {item.label}
              {item.required && (
                <span className="ml-1 text-red-500 dark:text-red-400">*</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
