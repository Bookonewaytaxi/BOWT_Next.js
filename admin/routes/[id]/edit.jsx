import ProtectedRoute from '@/components/auth/ProtectedRoute';
import EditRoutePage from '@/screens/admin/EditRoutePage';

export default function Page() {
  return (
    <ProtectedRoute>
      <EditRoutePage />
    </ProtectedRoute>
  );
}
