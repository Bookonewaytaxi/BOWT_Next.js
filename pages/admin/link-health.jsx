import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LinkHealthDashboard from '@/screens/admin/LinkHealthDashboard';

export default function Page() {
  return (
    <ProtectedRoute>
      <LinkHealthDashboard />
    </ProtectedRoute>
  );
}
