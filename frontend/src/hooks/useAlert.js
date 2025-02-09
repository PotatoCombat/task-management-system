import { useState } from "react";

const useAlert = () => {
  const [alert, setAlert] = useState({ severity: 'error', message: '', visible: 'hidden' });

  const hide = () => {
    setAlert(original => ({ ...original, visible: 'hidden' }));
  };

  const showSuccess = (message) => {
    setAlert({
      severity: 'success',
      message,
      visible: 'visible',
    });
  };

  const showError = (error) => {
    setAlert({
      severity: 'error',
      message: `${error.response?.data.message || error.message}`,
      visible: 'visible',
    });
  };

  return { alert, hide, showSuccess, showError };
}

export default useAlert;
