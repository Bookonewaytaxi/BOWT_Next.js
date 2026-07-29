import ProtectedRoute from '@/components/auth/ProtectedRoute';
import SitemapSettingsPage from '@/screens/admin/SitemapSettingsPage';

export default function Page() {
  return (
    <ProtectedRoute>
      <SitemapSettingsPage />
    </ProtectedRoute>
  );
}
