import { Navigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/services/auth';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const location = useLocation();
  
  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      // Check localStorage first
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          // Always get fresh user data from Firestore to ensure role is up to date
          const currentUser = await getCurrentUser();
          if (currentUser) {
            // Update localStorage with fresh user data
            localStorage.setItem('user', JSON.stringify(currentUser));
            return currentUser;
          }
          return parsed;
        } catch {
          return await getCurrentUser();
        }
      }
      return await getCurrentUser();
    },
    retry: false,
    staleTime: 2 * 60 * 1000, // 2 minutes - shorter to refresh role changes
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md px-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login with return path
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && user.role !== 'ADMIN') {
    // Log for debugging
    console.warn('Admin access denied:', {
      userRole: user.role,
      requireAdmin: requireAdmin,
      user: user
    });
    // Redirect to home if not admin
    return <Navigate to="/" replace />;
  }

  return children;
}

