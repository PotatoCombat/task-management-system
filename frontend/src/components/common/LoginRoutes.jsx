import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useProfile } from '@/contexts/ProfileContext';

const LOGIN_PAGE = '/';

const LoginRoutes = () => {
  const location = useLocation();

  const { profile, loading, loadProfile } = useProfile();

  useEffect(() => {
    loadProfile(); // Fetch profile on every route change
  }, [location.key]);

  if (loading) {
    return null;
  }
  if (!profile) {
    return <Navigate to={LOGIN_PAGE} />;
  }
  return <Outlet />;
}

export default LoginRoutes;
