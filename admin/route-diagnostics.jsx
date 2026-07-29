import ProtectedRoute from '@/components/auth/ProtectedRoute';
import RouteDiagnosticsPage from '@/screens/admin/RouteDiagnosticsPage';

export default function Page() {
  return (
    <ProtectedRoute>
      <RouteDiagnosticsPage />
    </ProtectedRoute>
  );
}
