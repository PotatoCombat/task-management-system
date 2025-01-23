require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

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

app.use((req, res, next) => {
  req.db = db; // passing DB service to all backend requests
  next();
})

/** APIS **/
app.get('/', (req, res) => {
  res.send('Task Management System - Backend API');
});

app.use('/users', require('./routes/userRoutes'));
app.use('/groups', require('./routes/userGroupRoutes'));

/** 404 HANDLER **/
app.use((req, res) => {
  res.status(404).send('404 Not Found');
});

/** START SERVER **/
app.listen(port, () => {
  console.log(`Task Management System listening at ${frontendDomain}:${port}`);
});
