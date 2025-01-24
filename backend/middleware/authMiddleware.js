const security = require('../utilities/security');

const msg_server_error = 'Server error. Please try again.';
const msg_access_denied = 'Access denied.';

function checkToken(req, res, next) {
  // Read token from Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  // No token
  if (!token) {
    return res.status(401).send(msg_access_denied);
  }

  // Verify token
  const result = security.verify_jwt(token);

  // Token is invalid
  if (!result) {
    return res.status(403).send(msg_access_denied);
  }

  // Token is valid
  req.username = result.username;
  next();
}

function checkGroup(...groups) {
  // Return middleware function
  return (req, res, next) => {
    // Check if user is in any of the groups
    const query = `
      SELECT *
      FROM user_group
      WHERE user_group_username = ?
      AND user_group_groupName IN (?)
    `;
    req.db.query(query, [req.username, groups], (err, results) => {
      // Server error
      if (err) {
        return res.status(500).send(msg_server_error);
      }

      // User is not in any of the groups
      if (results.length === 0) {
        return res.status(403).send(msg_access_denied);
      }

      // User is in one of the groups
      next();
    }); 
  }
}

module.exports = {
  checkToken,
  checkGroup,
};
