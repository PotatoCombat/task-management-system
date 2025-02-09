import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import { AppHeader, GroupRoutes, LoginRoutes } from '@/components';
import config from '@/config';
import { ProfileProvider } from '@/contexts/ProfileContext';
import {
  ErrorPage,
  LoginPage,
  LogoutPage,
  ProfilePage,
  TasksPage,
  UsersPage
} from '@/pages';

function App() {
  return (
    <ProfileProvider>
      <Router>
        <AppHeader />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/logout" element={<LogoutPage />} />

          {/* Private Routes */}
          <Route element={<LoginRoutes />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/tasks" element={<TasksPage />} />

            {/* Admin Routes */}
            <Route element={<GroupRoutes group={config.groups.admin} />}>
              <Route path="/users" element={<UsersPage />} />
            </Route>

            {/* 404 when logged in */}
            <Route path="*" element={<ErrorPage />} />
          </Route>

          {/* Redirect to login when logged out */}
          <Route path="*" element={<Navigate to={'/'} />} />

        </Routes>
      </Router>
    </ProfileProvider>
  );
}

export default App;
