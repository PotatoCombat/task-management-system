import { useState } from 'react';

import { Alert, Button, Container, FormGroup, TextField, Typography } from '@mui/material';

import api from '@/api';
import { useProfile } from '@/contexts/ProfileContext';
import useAlert from '@/hooks/useAlert';
import styles from './styles';

const ProfilePage = () => {
  const { profile, loadProfile } = useProfile();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { alert, showSuccess, showError } = useAlert();

  const handleSave = async () => {

    try {
      await api.updateProfile({ password, email });
      await loadProfile();
      showSuccess('Updated profile');
      setEmail('');
      setPassword('');
    } catch (error) {
      showError(error);
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <Container maxWidth={false} sx={styles.formContainer}>
      <Typography variant='h4' align='left' sx={styles.title}>My Profile</Typography>
      <FormGroup sx={styles.formGroup}>
        <Alert severity={alert.severity} sx={{ visibility: alert.visible }}>{alert.message}</Alert>
        <TextField
          id='username'
          label='Username'
          value={profile ? profile.username : ''}
          variant='outlined'
          fullWidth
          disabled
        />
        <TextField
          id='current-email'
          label='Email'
          value={profile ? profile.email : ''}
          variant='outlined'
          fullWidth
          disabled
        />
        <TextField
          id='email'
          label='Update Email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          variant='outlined'
          fullWidth
        />
        <TextField
          id='password'
          type='password'
          label='Update Password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          variant='outlined'
          fullWidth
        />
        <Button
          type='submit'
          onClick={handleSave}
          sx={styles.formButton}
          variant='contained'
          color='primary'
          fullWidth
        >
          SAVE
        </Button>
      </FormGroup>
    </Container>
  );
};

export default ProfilePage;
