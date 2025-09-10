import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { SecurityDashboard } from '@/components/admin/SecurityDashboard';

export default function AdminSecurityPage() {
  return (
    <AdminGuard>
      <AdminLayout>
        <SecurityDashboard />
      </AdminLayout>
    </AdminGuard>
  );
}
