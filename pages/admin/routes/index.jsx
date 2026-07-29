import ProtectedRoute from '@/components/auth/ProtectedRoute';
import RouteListPage from '@/screens/admin/RouteListPage';

export default function Page() {
  return (
    <ProtectedRoute>
      <RouteListPage />
    </ProtectedRoute>
  );
}
