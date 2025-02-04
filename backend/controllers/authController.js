const repository = require('../repositories/authRepository');

const config = require('../config');
const security = require('../utilities/security');

async function login(req, res) {
  const { username, password } = req.body;

  // Missing params
  if (!username || !password) {
    return res.status(400).send('Login requires username and password');
  }

  try {
    const { hashedPassword } = await repository.getHashedPassword({ username });

    // Username does not exist
    if (!hashedPassword) {
      return res.status(401).send('Login failed');
    }

    // Password is incorrect
    const match = await security.verifyHash(password, hashedPassword);
    if (!match) {
      return res.status(401).send('Login failed');
    }

    // Sign JWT token
    const token = security.createJwt(req.ip, req.headers['user-agent'], username);

    // Set cookie in HTTP response
    res.cookie(config.cookie.name, token, config.cookie.options);
    res.send('Login successful');

  } catch (error) {
    console.error(error);
    res.status(500).send('Error logging in');
  }
}

function logout(req, res) {
  const token = req.cookies[config.cookie.name];

  // User already logged out
  if (!token) {
    return res.status(400).send('Logout failed, already logged out');
  }

  // Clear cookie from user's browser
  res.clearCookie(config.cookie.name);
  res.send('Logout successful');
}

module.exports = {
  login,
  logout,
};
