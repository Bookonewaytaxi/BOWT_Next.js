import ProtectedRoute from '@/components/auth/ProtectedRoute';
import MarketingIntegrationsPage from '@/screens/admin/settings/MarketingIntegrationsPage';

export default function Page() {
  return (
    <ProtectedRoute>
      <MarketingIntegrationsPage />
    </ProtectedRoute>
  );
}
