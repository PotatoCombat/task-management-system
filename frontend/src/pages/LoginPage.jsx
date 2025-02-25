import { useState } from 'react';
import { Navigate } from 'react-router-dom';

import { Box, Button, FormGroup, TextField } from '@mui/material';

import api from '@/api';
import { useAlert } from '@/contexts/AlertContext';
import { useAuth } from '@/contexts/AuthContext';

import styles from './styles';


const LoginPage = () => {
  const { showError } = useAlert();
  const { session } = useAuth();

  const [loggedIn, setLoggedIn] = useState(session !== null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const login = async () => {
    try {
      await api.login({ username, password });
      setLoggedIn(true);
    } catch (error) {
      showError(error);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      login();
    }
  };

  if (loggedIn) {
    return <Navigate to={'/home'} />
  }

  return (
    <Box sx={styles.formContainer}>
      <FormGroup sx={styles.formGroup}>
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
          onClick={() => login()}
          sx={styles.formButton}
        >
          Login
        </Button>
      </FormGroup>
    </Box>
  );
};

export default LoginPage;
