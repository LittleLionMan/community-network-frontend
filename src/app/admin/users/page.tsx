import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { UserManagement } from '@/components/admin/UserManagement';

export default function AdminUsersPage() {
  return (
    <AdminGuard>
      <AdminLayout>
        <UserManagement />
      </AdminLayout>
    </AdminGuard>
  );
}
