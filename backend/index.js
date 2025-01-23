require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const security = require('./utilities/security');

/** ENVIRONMENT SETUP **/
let frontendDomain = process.env.FRONTEND_DOMAIN;
let port = process.env.PORT;

/** DATABASE SETUP **/
const db = mysql.createPool({
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

/** SERVER SETUP **/
const app = express();

/** MIDDLE WARES **/
app.use(cors());

app.use(express.json()); // Built-in middleware to parse JSON bodies

app.use((req, res, next) => {
  req.db = db; // passing DB service to all backend requests
  next();
})

function checkAuth(req, res, next) {
  const token = req.headers['authorization'];
  console.log(req);

  if (!token) {
    return res.status(401).send('Access denied. No token provided.');
  }

  const result = security.verify_jwt(token);
  if (!result) {
    return res.status(403).send('Invalid token.');
  }

  req.user = result;
  next();
}

/** APIS **/
app.get('/', (req, res) => {
  res.send('Task Management System - Backend API');
});

app.use('/auth', require('./routes/authRoutes'));
app.use('/users', checkAuth, require('./routes/userRoutes'));
app.use('/groups', checkAuth, require('./routes/userGroupRoutes'));

/** 404 HANDLER **/
app.use((req, res) => {
  res.status(404).send('404 Not Found');
});

/** START SERVER **/
app.listen(port, () => {
  console.log(`Task Management System listening at ${frontendDomain}:${port}`);
});
