require('dotenv').config();

const ENV = process.env;

module.exports = {
  port: ENV.PORT,
  cors: {
    origin: ENV.FRONTEND_URL,
    credentials: true,
  },
  db: {
    database: ENV.DB_NAME,
    host: ENV.DB_HOST,
    user: ENV.DB_USER,
    password: ENV.DB_PASSWORD,
    timezone: 'Z',
    dateStrings: true,
  },
  jwt: {
    secret: ENV.JWT_SECRET,
    options: {
      expiresIn: ENV.JWT_EXPIRY,
    },
  },
  bcryptjs: {
    saltRounds: 10,
  },
  cookie: {
    name: ENV.JWT_COOKIE,
    options: {
      httpOnly: true,
      secure: false,
      sameSite: 'Strict',
      maxAge: ENV.JWT_EXPIRY,
    },
  },
  email: {
    service: ENV.EMAIL_SERVICE,
    auth: {
      user: ENV.EMAIL_ACCOUNT,
      pass: ENV.EMAIL_PASSWORD
    }
  },
  accounts: {
    admin: ENV.ACCOUNT_ADMIN,
  },
  groups: {
    admin: ENV.GROUP_ADMIN,
    pl: ENV.GROUP_PL,
    pm: ENV.GROUP_PM,
  },
};
