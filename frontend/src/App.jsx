import { Navigate, Route, Routes } from 'react-router-dom';

import { Box } from '@mui/material';

import config from '@/config';
import { AppAlert, AppHeader, GlobalRoutes, GroupRoutes, LoginRoutes } from '@/components';
import {
  ApplicationsPage,
  KanbanPage,
  LoginPage,
  LogoutPage,
  ProfilePage,
  TaskPage,
  UsersPage
} from '@/pages';

function App() {
  return (
    <>
      <Box className='header' sx={{ position: 'fixed', width: '100%', zIndex: 10 }}>
        <AppHeader />
        <AppAlert />
      </Box>
      <Box className='page' sx={{ pt: '96px', pl: 4, pr: 4, pb: 4, width: '100%', height: '100%' }}>
        <Routes>
          {/* Public Routes */}
          <Route element={<GlobalRoutes />}>
            <Route path="/" element={<LoginPage />} />
            <Route path="/logout" element={<LogoutPage />} />

            {/* Private Routes */}
            <Route element={<LoginRoutes />}>
              <Route path="/home" element={<ApplicationsPage />} />
              <Route path="/apps/:application" element={<KanbanPage />} />
              <Route path="/apps/:application/create-task" element={<TaskPage />} />
              <Route path="/apps/:application/task/:taskId" element={<TaskPage />} />
              <Route path="/profile" element={<ProfilePage />} />

              {/* Admin Routes */}
              <Route element={<GroupRoutes group={config.groups.admin}/>}>
                <Route path="/users" element={<UsersPage />} />
              </Route>
            </Route>

            {/* Redirect to login when logged out */}
            <Route path="*" element={<Navigate to={'/'} />} />
          </Route>
        </Routes>
      </Box>
    </>
  );
}

export default App;
