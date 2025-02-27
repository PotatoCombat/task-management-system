require('dotenv').config();

module.exports = {
  port: process.env.PORT,
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
  db: {
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    timezone: 'Z',
    dateStrings: true,
  },
  email: {
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_ACCOUNT,
      pass: process.env.EMAIL_PASSWORD
    }
  },
};
