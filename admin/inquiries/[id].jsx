import ProtectedRoute from '@/components/auth/ProtectedRoute';
import InquiryDetailPage from '@/screens/admin/InquiryDetailPage';

export default function Page() {
  return (
    <ProtectedRoute>
      <InquiryDetailPage />
    </ProtectedRoute>
  );
}
