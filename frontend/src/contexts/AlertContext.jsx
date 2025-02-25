import { createContext, useContext, useState } from 'react';

const AlertContext = createContext();

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within a AlertProvider");
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState({ severity: 'error', visible: 'hidden', message: '', persist: false });

  const hide = () => {
    setAlert(original => ({ ...original, visible: original.persist ? 'visible' : 'hidden', persist: false }));
  };

  const showSuccess = (message, { persist } = {}) => {
    setAlert({ severity: 'success', visible: 'visible', message, persist: persist ?? false });
  };

  const showError = (error, { persist } = {}) => {
    setAlert({ severity: 'error', visible: 'visible', message: `${error.response?.data.message || error.message}`, persist: persist ?? false });
  };

  return (
    <AlertContext.Provider value={{ alert, hide, showSuccess, showError }}>
      {children}
    </AlertContext.Provider>
  );
};
