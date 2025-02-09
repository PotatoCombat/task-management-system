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

app.use(require('./middleware/formatRequest'));
app.use(require('./routes/authRoutes'));

app.use(require('./middleware/getLoginUser'));
app.use(require('./routes/profileRoutes'));

app.use(require('./middleware/checkAdmin'));
app.use(require('./routes/userRoutes'));
app.use(require('./routes/groupRoutes'));

/** ERROR HANDLERS **/
app.use((req, res) => {
  res.status(404).send('404 Not Found');
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send('Server error, please try again');
});

/** START SERVER **/
app.listen(config.port, () => {
  console.log(`Task Management System listening at http://localhost:${config.port}`);
});
