'use client';

import { useState } from 'react';
import { Trash2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDeletePost } from '@/hooks/useDiscussions';

interface PostDeleteButtonProps {
  postId: number;
}

export function PostDeleteButton({ postId }: PostDeleteButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const deletePost = useDeletePost();

  const handleDelete = async () => {
    try {
      await deletePost.mutateAsync(postId);
      setShowConfirm(false);
    } catch (error) {
      // Error handled by hook
    }
  };

  if (!showConfirm) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowConfirm(true)}
        title="Löschen"
        className="text-red-600 hover:bg-red-50 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 rounded-lg border border-red-300 bg-red-50 p-4 shadow-xl sm:static sm:inset-auto sm:flex sm:items-center sm:gap-2 sm:rounded-md sm:p-2 sm:shadow-none">
      <div className="mb-3 flex items-start gap-2 sm:mb-0">
        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 sm:mt-0" />
        <span className="text-sm text-red-800 sm:whitespace-nowrap sm:text-xs">
          Wirklich löschen?
        </span>
      </div>

      <div className="flex gap-2 sm:ml-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
          disabled={deletePost.isPending}
          className="flex-1 border-red-300 bg-red-600 text-white hover:bg-red-700 sm:flex-initial"
        >
          {deletePost.isPending ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : (
            'Ja'
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowConfirm(false)}
          disabled={deletePost.isPending}
          className="flex-1 border-gray-300 text-gray-600 sm:flex-initial"
        >
          Nein
        </Button>
      </div>
    </div>
  );
}
