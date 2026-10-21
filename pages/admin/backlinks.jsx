import ProtectedRoute from '@/components/auth/ProtectedRoute';
import BacklinkAutomationPage from '@/screens/admin/BacklinkAutomationPage';

export default function Page() {
  return (
    <ProtectedRoute>
      <BacklinkAutomationPage />
    </ProtectedRoute>
  );
}
