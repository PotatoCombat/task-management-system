import { createContext, useContext, useEffect, useRef, useState } from 'react';

import api from '@/api';

const ProfileContext = createContext();

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const updating = useRef(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (updating.current) {
      return;
    }
    updating.current = true;
    try {
      const response = await api.getProfile();
      setProfile(response.data);
    } catch (error) {
      setProfile(null);
    } finally {
      setLoading(false);
    }
    updating.current = false;
  };

  const clearProfile = () => {
    setProfile(null);
  }

  return (
    <ProfileContext.Provider value={{ profile, loading, loadProfile, clearProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};
