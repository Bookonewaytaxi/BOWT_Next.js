import ProtectedRoute from '@/components/auth/ProtectedRoute';
import RouteSeoPage from '@/screens/admin/RouteSeoPage';

export default function Page() {
  return (
    <ProtectedRoute>
      <RouteSeoPage />
    </ProtectedRoute>
  );
}
