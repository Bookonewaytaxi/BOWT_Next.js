import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminInquiriesPage from '@/screens/admin/AdminInquiriesPage';

export default function Page() {
  return (
    <ProtectedRoute>
      <AdminInquiriesPage />
    </ProtectedRoute>
  );
}
