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
    <div className="flex items-center gap-2 rounded-md bg-red-50 p-2">
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <span className="text-sm text-red-800">Wirklich löschen?</span>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDelete}
        disabled={deletePost.isPending}
        className="border-red-300 bg-red-600 text-white hover:bg-red-700"
      >
        {deletePost.isPending ? (
          <RefreshCw className="h-3 w-3 animate-spin" />
        ) : (
          'Ja'
        )}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowConfirm(false)}
        disabled={deletePost.isPending}
        className="text-gray-600"
      >
        Nein
      </Button>
    </div>
  );
}
