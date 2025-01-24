const security = require('../utilities/security');

async function login(req, res) {
  const { username = '_', password = '_' } = req.body || {};

  req.db.query('SELECT * FROM users WHERE user_username = ?', [username], async (err, results) => {
    // Server error
    if (err) {
      return res.status(500).send('Error authenticating user');
    }

    const errorMessage = 'Invalid username or password';

    // Username does not exist
    if (results.length === 0) {
      return res.status(401).send(errorMessage);
    }

    // Username exists
    const user = results[0];

    // Password is incorrect
    const match = await security.verify_hash(password, user.user_password);
    if (!match) {
      return res.status(401).send(errorMessage);
    }

    // Return signed JWT token  
    res.json(security.create_jwt(req.ip, req.headers['user-agent'], username));
  });
}

module.exports = {
  login,
};
