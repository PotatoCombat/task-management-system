import { createContext, useContext, useState } from 'react';

import api from '@/api';
import config from '@/config';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);

  const updateSession = async () => {
    try {
      const response = await api.getSession();
      setSession(response.data);
    } catch (error) {
      setSession(null);
    }
  }

  const isUserInGroup = (group) => {
    return session && session.groups.includes(group);
  }

  const hasUserGroup = (group) => {
    return session && session.groups.includes(group);
  }

  const isAdmin = () => {
    return isUserInGroup(config.groups.admin);
  }

  const isProjectLead = () => {
    return isUserInGroup(config.groups.pl);
  }

  const isProjectManager = () => {
    return isUserInGroup(config.groups.pm);
  }

  return (
    <AuthContext.Provider value={{ session, updateSession, isUserInGroup, isAdmin, isProjectLead, isProjectManager }}>
      {children}
    </AuthContext.Provider>
  );
};
