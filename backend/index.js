require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mysql = require('mysql2');

const { checkToken, checkGroup } = require('./middleware/authMiddleware');

/** ENVIRONMENT SETUP **/
const frontendUrl = process.env.FRONTEND_URL;
const port = process.env.PORT;

const groupAdmin = process.env.GROUP_ADMIN;
const groupPl = process.env.GROUP_PL;
const groupPm = process.env.GROUP_PM;

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
app.use(cors({
  origin: frontendUrl, // Replace with your frontend URL
  credentials: true, // Allow credentials (cookies)
}));

app.use(express.json()); // Built-in middleware to parse JSON bodies
app.use(cookieParser()); // To parse cookies

app.use((req, res, next) => {
  req.db = db; // passing DB service to all backend requests
  next();
})

/** APIS **/
app.use('/', require('./routes/authRoutes'));
app.use('/users', checkToken, checkGroup(groupAdmin), require('./routes/userRoutes'));
app.use('/groups', checkToken, require('./routes/userGroupRoutes'));

/** 404 HANDLER **/
app.use((req, res) => {
  res.status(404).send('404 Not Found');
});

/** START SERVER **/
app.listen(port, () => {
  console.log(`Task Management System listening at http://localhost:${port}`);
});
