import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';

const GroupRoutes = ({ group }) => {
  const { session } = useAuth();

  if (!group || !session.groups.includes(group)) {
    return <Navigate to='/logout' />;
  }
  return <Outlet />;
}

export default GroupRoutes;
