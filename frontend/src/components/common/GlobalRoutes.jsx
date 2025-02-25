import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';

const GlobalRoutes = () => {
  const location = useLocation();
  const { updateSession } = useAuth();

  const [locationKey, setLocationKey] = useState(null);
  const mounted = useRef(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (mounted.current === location.key) {
        return;
      }
      mounted.current = location.key;
      console.log('Navigating to:', location.pathname);
      await updateSession();
      setLocationKey(location.key);
    };

    checkAuth();

  }, [location.key, updateSession]);

  if (locationKey !== location.key) {
    return null;
  }

  return <Outlet />;
}

export default GlobalRoutes;
