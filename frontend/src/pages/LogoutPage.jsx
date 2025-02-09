import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '@/api';
import { useProfile } from '@/contexts/ProfileContext';

const LOGIN_PAGE = '/';

const LogoutPage = () => {
  const navigate = useNavigate();

  const { clearProfile } = useProfile();

  useEffect(() => {
    logout();
  }, [])

  const logout = async () => {
    try {
      await api.logout()
    } catch (error) {
    } finally {
      clearProfile();
      navigate(LOGIN_PAGE);
    }
  };

  return null;
};

export default LogoutPage;
