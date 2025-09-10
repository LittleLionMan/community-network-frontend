import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ContentModeration } from '@/components/admin/ContentModeration';

export default function AdminContentPage() {
  return (
    <AdminGuard>
      <AdminLayout>
        <ContentModeration />
      </AdminLayout>
    </AdminGuard>
  );
}
