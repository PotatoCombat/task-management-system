import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { Alert } from '@mui/material';

import { useAlert } from '@/contexts/AlertContext';

const AppAlert = () => {
  const location = useLocation();
  const { alert, hide } = useAlert();

  useEffect(() => {
    hide();
  }, [location.key]);

  return (
    <Alert variant='filled' severity={alert.severity} sx={{ height: '48px', width: '100%', visibility: alert.visible }}>
      {alert.message}
    </Alert>
  );
};

export default AppAlert;
