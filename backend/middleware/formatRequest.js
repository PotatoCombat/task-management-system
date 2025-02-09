const http = require('../utilities/http');

const formatRequest = http.asyncHandler((req, res, next) => {
  if (req.body.username) {
    req.body.username = req.body.username.toLowerCase();
  }
  next();
});

module.exports = formatRequest;
