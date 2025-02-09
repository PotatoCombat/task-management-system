import { Link } from 'react-router-dom';

import { AppBar, Box, Button, Toolbar, Typography, useMediaQuery, useTheme } from '@mui/material';

import config from '@/config';
import { useProfile } from '@/contexts/ProfileContext';

const AppHeader = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const { profile } = useProfile();

  const isAdmin = profile?.groups.includes(config.groups.admin) || false;

  const leftRoutes = [
    { path: '/tasks', name: 'Task Management', visible: true },
    { path: '/users', name: 'User Management', visible: isAdmin },
  ];

  const rightRoutes = [
    { path: '/profile', name: 'Profile', visible: true },
    { path: '/logout', name: 'Logout', visible: true },
  ];

  return (
    <AppBar position={'static'} sx={style.appBar}>
      <Toolbar variant={'dense'} sx={style.toolbar}>

        {/* Title */}
        <Typography variant='h6' sx={style.logo}>
          {isSmallScreen ? 'TMS' : 'Task Management System'}
        </Typography>

        {/* Left Section */}
        {profile && (
          <Box sx={style.leftContainer}>
            {leftRoutes
              .filter(route => route.visible)
              .map(route => (
                <Button component={Link} key={route.name} to={route.path} sx={style.leftButton}>
                  {route.name}
                </Button>
              ))
            }
          </Box>
        )}

        {/* Right Section */}
        {profile && (
          <Box sx={style.rightContainer}>
            <Typography>Logged in as: {profile.username}</Typography>
            {rightRoutes
              .filter(route => route.visible)
              .map(route => (
                <Button component={Link} key={route.name} to={route.path} sx={style.rightButton}>
                  {route.name}
                </Button>
              ))
            }
          </Box>
        )}

      </Toolbar>
    </AppBar>
  );
};

const style = {
  appBar: {
    backgroundColor: '#F0F0F3',
    color: '#000',
    whiteSpace: "nowrap",
  },
  toolbar: {
    width: '100%',
    overflow: 'auto',
    scrollbarWidth: "none", // Firefox
    "&::-webkit-scrollbar": {
      display: "none", // Chrome, Safari
    },
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    mr: '8px',
  },
  leftContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  leftButton: {
    fontWeight: 'normal',
    marginLeft: '8px',
    color: '#000',
  },
  rightContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    ml: '100px',
  },
  rightButton: {
    fontWeight: 'normal',
    marginLeft: '16px',
    backgroundColor: '#FFF',
    border: '1px solid #000',
    borderRadius: '10px',
    color: '#000',
    textTransform: 'none',
    padding: '6px 64px',
  },
};

export default AppHeader;
