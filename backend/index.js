const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const config = require('./config');

/** SETUP SERVER **/
const app = express();

app.use(cors(config.cors)); // Accept requests from frontend
app.use(express.json());    // Parse JSON bodies
app.use(cookieParser());    // Parse cookies

/** API **/
app.get('/', (req, res) => res.send('Welcome to Task Management System API'));
app.use('/user', require('./routes/userRoutes'));

/** ERROR HANDLERS **/
app.use((req, res) => {
  res.status(403).send('Access denied');
});

/** START SERVER **/
app.listen(config.port, () => {
  console.log(`Task Management System listening at http://localhost:${config.port}`);
});
