import ProtectedRoute from '@/components/auth/ProtectedRoute';
import CreateRoutePage from '@/screens/admin/CreateRoutePage';

export default function Page() {
  return (
    <ProtectedRoute>
      <CreateRoutePage />
    </ProtectedRoute>
  );
}
