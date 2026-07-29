import { useAuth } from '@/contexts/SupabaseAuthContext';
import LoginForm from '@/components/LoginForm';

// Used to wrap any /admin/* page's default export:
//   export default function AdminPage() {
//     return <ProtectedRoute><AdminDashboard /></ProtectedRoute>;
//   }
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-amber-500">
        Loading...
      </div>
    );
  }

  return user ? children : <LoginForm />;
}
