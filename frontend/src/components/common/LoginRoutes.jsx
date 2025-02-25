import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';

const LoginRoutes = () => {
  const { session } = useAuth();

  if (!session) {
    return <Navigate to='/' />;
  }
  return <Outlet />;
}

export default LoginRoutes;
