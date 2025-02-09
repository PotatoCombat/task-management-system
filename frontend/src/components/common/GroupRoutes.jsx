import { Outlet } from 'react-router-dom';

import { useProfile } from '@/contexts/ProfileContext';

const GroupRoutes = ({ group }) => {
  const { profile } = useProfile();

  if (!group || !profile.groups.includes(group)) {
    return <ErrorPage />;
  }
  return <Outlet />;
}

export default GroupRoutes;
