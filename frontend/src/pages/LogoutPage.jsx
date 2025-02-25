import { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';

import { Container, Typography } from '@mui/material';

import api from '@/api';
import { useAlert } from '@/contexts/AlertContext';

import styles from './styles';


const LOGIN_PAGE = '/';

const LogoutPage = () => {
  const { showError } = useAlert();

  const [loggedOut, setLoggedOut] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) {
      return;
    }
    mounted.current = true;
    logout();
  }, [])

  const logout = async () => {
    try {
      await api.logout()
    } catch (error) {
      showError(error, { persist: true });
    } finally {
      setLoggedOut(true);
    }
  };

  if (loggedOut) {
    return <Navigate to={LOGIN_PAGE} />
  }

  return (
    <Container maxWidth={false}>
      <Typography variant='h4' align='left' sx={styles.title}>Logging out...</Typography>
    </Container>
  );
};

export default LogoutPage;
