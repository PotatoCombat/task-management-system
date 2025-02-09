const config = require('../config');

const repository = require('../repositories/authRepository');

const { AuthenticationError } = require('../utilities/errors');
const http = require('../utilities/http');
const security = require('../utilities/security');

const login = http.asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // Validate params
  if (!username || !password) {
    throw new AuthenticationError('Login requires username and password');
  }

  // Find credentials
  const credentials = await repository.getCredentials({ username });
  if (!credentials || !credentials.enabled) {
    throw new AuthenticationError('Login failed');
  }

  // Password is incorrect
  const match = await security.verifyHash(password, credentials.hashedPassword);
  if (!match) {
    throw new AuthenticationError('Login failed');
  }

  // Sign JWT token
  const token = security.createJwt(req.ip, req.headers['user-agent'], username);

  // Set cookie in HTTP response
  res.cookie(config.cookie.name, token, config.cookie.options);
  res.json({ message: 'Login successful' });
});

const logout = http.asyncHandler(async (req, res) => {
  // Read cookie
  const token = req.cookies[config.cookie.name];
  if (!token) {
    throw new AuthenticationError('Already logged out');
  }

  // Clear cookie from user's browser
  res.clearCookie(config.cookie.name);
  res.json({ message: 'Logout successful' });
});

module.exports = {
  login,
  logout,
};
