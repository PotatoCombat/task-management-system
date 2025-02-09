const ENV = import.meta.env;

export default {
  main: ENV.VITE_MAIN,
  port: ENV.VITE_PORT,
  backend: {
    baseURL: ENV.VITE_BACKEND_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  },
  cookie: ENV.VITE_COOKIE,
  accounts: {
    admin: ENV.VITE_ACCOUNT_ADMIN,
  },
  groups: {
    admin: ENV.VITE_GROUP_ADMIN,
    pl: ENV.VITE_GROUP_PL,
    pm: ENV.VITE_GROUP_PM,
  },
};
