import ProtectedRoute from '@/components/auth/ProtectedRoute';
import SeoDashboardPage from '@/screens/admin/SeoDashboardPage';

export default function Page() {
  return (
    <ProtectedRoute>
      <SeoDashboardPage />
    </ProtectedRoute>
  );
}
