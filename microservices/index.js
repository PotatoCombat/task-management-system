const config = require('./config');

const express = require('express');
const cors = require('cors');

/** SETUP SERVER **/
const app = express();

app.use(cors(config.cors)); // Accept requests from frontend
app.use(express.json());    // Parse JSON bodies

/** API **/
app.use('/', require('./routes'));

/** ERROR HANDLERS **/
app.use((req, res) => {
  res.status(403).send('Access denied');
});

/** START SERVER **/
app.listen(config.port, () => {
  console.log(`Task Management System listening at http://localhost:${config.port}`);
});
