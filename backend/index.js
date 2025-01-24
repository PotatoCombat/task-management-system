require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const { checkToken, checkGroup } = require('./middleware/authMiddleware');

/** ENVIRONMENT SETUP **/
const frontendDomain = process.env.FRONTEND_DOMAIN;
const port = process.env.PORT;

const group_admin = process.env.GROUP_ADMIN;
const group_pl = process.env.GROUP_PL;
const group_pm = process.env.GROUP_PM;

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

/** APIS **/
app.get('/', (req, res) => {
  res.send('Task Management System - Backend API');
});

app.use('/auth', require('./routes/authRoutes'));
app.use('/users', checkToken, checkGroup(group_admin), require('./routes/userRoutes'));
app.use('/groups', checkToken, require('./routes/userGroupRoutes'));

/** 404 HANDLER **/
app.use((req, res) => {
  res.status(404).send('404 Not Found');
});

/** START SERVER **/
app.listen(port, () => {
  console.log(`Task Management System listening at ${frontendDomain}:${port}`);
});
