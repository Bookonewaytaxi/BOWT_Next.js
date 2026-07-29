import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminDashboard from '@/screens/AdminDashboard';

export default function Page() {
  return (
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  );
}
