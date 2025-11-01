'use client';

import { useState } from 'react';
import { Pin, Lock, Trash2, AlertTriangle, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUpdateThread, useDeleteThread } from '@/hooks/useDiscussions';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import type { ForumThread } from '@/types/forum';

interface ThreadModActionsProps {
  thread: ForumThread;
}

export function ThreadModActions({ thread }: ThreadModActionsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const updateThread = useUpdateThread();
  const deleteThread = useDeleteThread();
  const router = useRouter();
  const { user } = useAuthStore();

  const handlePin = async () => {
    await updateThread.mutateAsync({
      threadId: thread.id,
      data: { is_pinned: !thread.is_pinned },
    });
  };

  const isAdmin = user?.is_admin ?? false;
  const isCreator = user?.id === thread.creator.id;

  const handleLock = async () => {
    await updateThread.mutateAsync({
      threadId: thread.id,
      data: { is_locked: !thread.is_locked },
    });
  };

  const handleDelete = async () => {
    await deleteThread.mutateAsync(thread.id);
    router.push(`/forum/categories/${thread.category.id}`);
  };

  if (showDeleteConfirm) {
    return (
      <>
        <div
          className="fixed inset-0 z-40 bg-black/50 sm:hidden"
          onClick={() => setShowDeleteConfirm(false)}
        />

        <div className="fixed inset-x-4 top-1/2 z-50 -translate-y-1/2 rounded-lg border border-red-300 bg-white p-4 shadow-xl sm:static sm:inset-auto sm:translate-y-0 sm:border-red-300 sm:bg-red-50 sm:p-4">
          <div className="mb-3 flex items-start justify-between sm:hidden">
            <h3 className="text-base font-semibold text-gray-900">
              Thread löschen
            </h3>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-4 flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
            <div className="flex-1">
              <h4 className="font-medium text-red-900 sm:text-sm">
                Thread wirklich löschen?
              </h4>
              <p className="mt-1 text-sm text-red-700">
                Diese Aktion kann nicht rückgängig gemacht werden. Der Thread
                und alle Posts werden unwiderruflich gelöscht.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleteThread.isPending}
              className="order-2 sm:order-1"
            >
              Abbrechen
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={deleteThread.isPending}
              className="order-1 flex items-center justify-center gap-2 border-red-300 bg-red-600 text-white hover:bg-red-700 sm:order-2"
            >
              {deleteThread.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Löschen...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Endgültig löschen
                </>
              )}
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {isAdmin && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePin}
            disabled={updateThread.isPending}
            title={thread.is_pinned ? 'Unpinnen' : 'Anpinnen'}
          >
            <Pin
              className={`h-4 w-4 ${thread.is_pinned ? 'fill-current text-blue-600' : ''}`}
            />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLock}
            disabled={updateThread.isPending}
            title={thread.is_locked ? 'Entsperren' : 'Sperren'}
          >
            <Lock
              className={`h-4 w-4 ${thread.is_locked ? 'text-red-600' : ''}`}
            />
          </Button>
        </>
      )}

      {(isAdmin || isCreator) && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDeleteConfirm(true)}
          disabled={deleteThread.isPending}
          className="text-red-600 hover:bg-red-50"
          title="Löschen"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
