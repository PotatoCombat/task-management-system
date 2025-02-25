import { Link } from 'react-router-dom';

import { AppBar, Box, Button, Typography, useMediaQuery, useTheme } from '@mui/material';

import config from '@/config';
import { useAuth } from '@/contexts/AuthContext';

const AppHeader = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const { session, isUserInGroup } = useAuth();

  const isAdmin = isUserInGroup(config.groups.admin);

  const leftRoutes = [
    { path: '/home', name: 'Task Management', visible: true },
    { path: '/users', name: 'User Management', visible: isAdmin },
  ];

  const rightRoutes = [
    { path: '/profile', name: 'Profile', visible: true },
    { path: '/logout', name: 'Logout', visible: true },
  ];

  return (
    <AppBar sx={style.appBar}>
      {/* Title */}
      <Typography variant='h6' sx={style.logo}>
        {isSmallScreen ? 'TMS' : 'Task Management System'}
      </Typography>

      {/* Left Section */}
      {session && (
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
      {session && (
        <Box sx={style.rightContainer}>
          <Typography sx={style.username}>Logged in as: {session.username}</Typography>
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
    </AppBar>
  );
};

const style = {
  appBar: {
    display: 'flex',
    flexDirection: 'row',
    position: 'static',
    alignItems: 'center',
    height: '48px',
    pl: 1,
    pr: 1,
    whiteSpace: 'nowrap',
    backgroundColor: '#F0F0F3',
    color: '#000',
    border: '1px solid #ccc',
    boxShadow: 'none',
    overflow: 'auto',
    scrollbarWidth: "none", // Firefox
    "&::-webkit-scrollbar": {
      display: "none", // Chrome, Safari
    },
  },
  logo: {
    mt: '-2px',
    mr: '8px',
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  username: {
    alignSelf: 'center',
  },
  leftContainer: {
    display: 'flex',
    mr: 'auto',
  },
  leftButton: {
    p: 'auto',
    fontSize: '1rem',
    fontWeight: 'normal',
    textTransform: 'none',
    color: '#000',
  },
  rightContainer: {
    display: 'flex',
    ml: 10,
  },
  rightButton: {
    ml: 2,
    pt: 0.5,
    pb: 0.5,
    pl: 8,
    pr: 8,
    fontSize: '1rem',
    fontWeight: 'normal',
    textTransform: 'none',
    color: '#000',
    backgroundColor: '#FFF',
    border: '1px solid #000',
    borderRadius: 2,
  },
};

export default AppHeader;
