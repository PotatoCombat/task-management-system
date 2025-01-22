const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mysql = require('mysql2');

/** ENVIRONMENT SETUP **/
dotenv.config();

let frontendDomain = process.env.FRONTEND_DOMAIN;
let port = process.env.PORT;

/** DATABASE SETUP **/

const db = mysql.createPool({
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10, // Max number of concurrent connections
  queueLimit: 0        // Unlimited queue for pending connections
});

db.query('SELECT * FROM users', (err, results, fields) => {
  if (err) {
    console.error('FAIL', err.stack);
  } else {
    console.log('Users:', results);
  }
});

const app = express();

/** APIS **/
app.get('/', (req, res) => {
  res.send('Task Management System - Backend API');
});

/** START SERVER **/
app.listen(port, () => {
  console.log(`Task Management System listening at ${frontendDomain}:${port}`);
});
