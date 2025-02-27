import { useEffect, useState } from 'react';

import { Box, Button, FormGroup, TextField, Typography } from '@mui/material';

import api from '@/api';
import { useAlert } from '@/contexts/AlertContext';

import styles from './styles';


const ProfilePage = () => {
  const [profile, setProfile] = useState(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { showSuccess, showError } = useAlert();

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const response = await api.getProfile();
      setProfile(response.data);
    } catch (error) {
      showError(error);
    }
  }

  const handleSave = async () => {

    try {
      await api.updateProfile({ password, email });
      await fetchProfile();
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
    <Box sx={styles.formContainer}>
      <Typography variant='h4' align='left' sx={styles.title}>My Profile</Typography>
      <FormGroup sx={styles.formGroup}>
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
    </Box>
  );
};

export default ProfilePage;
