import ProtectedRoute from '@/components/auth/ProtectedRoute';
import FaqManagerPage from '@/screens/admin/FaqManagerPage';

export default function Page() {
  return (
    <ProtectedRoute>
      <FaqManagerPage />
    </ProtectedRoute>
  );
}
