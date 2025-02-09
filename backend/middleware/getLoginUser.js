const config = require('../config');

const repository = require('../repositories/authRepository');

const { AuthenticationError } = require('../utilities/errors');
const http = require('../utilities/http');
const security = require('../utilities/security');

const getLoginUser = http.asyncHandler(async function(req, res, next) {
  // Read cookie
  const token = req.cookies[config.cookie.name];
  if (!token) {
    throw new AuthenticationError('Access denied');
  }

  // Verify token
  const result = security.decodeJwt(token);
  if (!result) {
    throw new AuthenticationError('Access denied');
  }

  const { ip, browserType, username } = result;

  // Token has different IP
  if (ip !== req.ip) {
    throw new AuthenticationError('Access denied');
  }
  // Token has different browser
  if (browserType !== req.headers['user-agent']) {
    throw new AuthenticationError('Access denied');
  }
  // Check account status
  const enabled = await repository.isEnabled({ username });
  if (!enabled) {
    throw new AuthenticationError('Access denied');
  }

  req.username = username;
  next();
});

module.exports = getLoginUser;
