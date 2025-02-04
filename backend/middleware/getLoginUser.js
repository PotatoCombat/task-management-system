const config = require('../config')
const security = require('../utilities/security');

function getLoginUser(req, res, next) {
  // Read token from cookie
  const token = req.cookies[config.cookie.name];

  // No token
  if (!token) {
    return res.status(404).send('Access denied');
  }

  // Verify token
  const result = security.decodeJwt(token);

  // Token is invalid
  if (!result) {
    return res.status(404).send('Access denied');
  }

  const { ip, browserType, username } = result;

  // Different IP
  if (ip !== req.ip) {
    return res.status(404).send('Access denied');
  }
  // Different browser
  if (browserType !== req.headers['user-agent']) {
    return res.status(404).send('Access denied');
  }

  // Token is valid
  req.username = username;
  next();
}

module.exports = getLoginUser;
