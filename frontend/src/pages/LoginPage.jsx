import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { Alert, Button, Container, FormGroup, TextField } from '@mui/material';

import api from '@/api';
import { useProfile } from '@/contexts/ProfileContext';
import useAlert from '@/hooks/useAlert';
import styles from './styles';

const HOME_PAGE = '/tasks';

const LoginPage = () => {
  const navigate = useNavigate();

  const { alert, showError } = useAlert();
  const { loading, profile, loadProfile } = useProfile();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await api.login({ username, password });
      await loadProfile();
    } catch (error) {
      showError(error);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleLogin();
    }
  };

  if (loading) {
    return null;
  }

  if (profile) {
    return <Navigate to={HOME_PAGE} />
  }

  return (
    <Container maxWidth={false} sx={styles.formContainer}>
      <FormGroup sx={styles.formGroup}>
        <Alert severity={alert.severity} sx={{ visibility: alert.visible }}>{alert.message}</Alert>
        <TextField
          label='Username'
          variant='outlined'
          fullWidth
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={handleKeyDown} // Handle Enter key
        />
        <TextField
          label='Password'
          variant='outlined'
          type='password'
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown} // Handle Enter key
        />
        <Button
          variant='contained'
          color='primary'
          fullWidth
          onClick={handleLogin}
          sx={styles.formButton}
        >
          Login
        </Button>
      </FormGroup>
    </Container>
  );
};

export default LoginPage;
