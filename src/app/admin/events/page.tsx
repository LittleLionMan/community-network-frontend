import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { EventCategoryManagement } from '@/components/admin/EventCategoryManagement';

export default function AdminEventsPage() {
  return (
    <AdminGuard>
      <AdminLayout>
        <EventCategoryManagement />
      </AdminLayout>
    </AdminGuard>
  );
}
