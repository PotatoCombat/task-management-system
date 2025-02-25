const config = require('../config');

const jwt = require('jsonwebtoken');

const db = require('../utilities/database');

const getLoginUser = async function(req, res, next) {
  // Read cookie
  const token = req.cookies[config.cookie.name];
  if (!token) {
    return res.status(403).json({ message: 'Access denied' });
  }

  // Verify token
  let result;
  try {
    result = jwt.verify(token, config.jwt.secret);
  } catch (error) {
    return res.status(403).json({ message: 'Access denied' });
  }

  const { ip, browserType, username } = result;

  // Token has different IP
  if (ip !== req.ip) {
    return res.status(403).json({ message: 'Access denied' });
  }
  // Token has different browser
  if (browserType !== req.headers['user-agent']) {
    return res.status(403).json({ message: 'Access denied' });
  }
  // Check account status
  const [rows] = await db.execute('SELECT 1 FROM user WHERE user_username = ? AND user_enabled = 1', [username]);
  if (rows.length === 0) {
    return res.status(403).json({ message: 'Access denied' });
  }

  req.username = username;
  next();
};

const isLoginUserInGroup = (group) => {
  return async (req, res, next) => {
    const result = await checkGroup(req.username, group);
    if (!result) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};

const checkGroup = async (username, group) => {
  if (!username || !group) {
    return false;
  }
  const [rows] = await db.execute(
    'SELECT 1 FROM user_group WHERE user_group_username = ? AND user_group_groupName = ?',
    [username, group]
  );
  return rows.length > 0;
}

module.exports = {
  getLoginUser,
  isLoginUserInGroup,
}
