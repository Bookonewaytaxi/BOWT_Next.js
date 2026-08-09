import ProtectedRoute from '@/components/auth/ProtectedRoute';
import MetaConfigPage from '@/screens/admin/MetaConfigPage';

export default function Page() {
  return (
    <ProtectedRoute>
      <MetaConfigPage />
    </ProtectedRoute>
  );
}
