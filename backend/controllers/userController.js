const config = require('../config');

const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const db = require('../utilities/database');


/** AUTHENTICATION **/

const login = async (req, res) => {
  let { username, password } = req.body;
  username = username.toLowerCase();

  // Validate params
  if (!username || !password) {
    return res.status(403).json({ message: 'Login requires username and password' });
  }

  // Find credentials
  const [rows] = await db.execute(
    'SELECT user_password as hashedPassword FROM user WHERE user_username = ? AND user_enabled = 1',
    [username]
  );
  if (rows.length === 0) {
    return res.status(403).json({ message: 'Login failed' });
  }

  // Password is incorrect
  const hashedPassword = rows[0].hashedPassword;
  const match = await bcryptjs.compare(password, hashedPassword);
  if (!match) {
    return res.status(403).json({ message: 'Login failed' });
  }

  // Sign JWT token
  const token = jwt.sign(
    { ip: req.ip, browserType: req.headers['user-agent'], username: username },
    config.jwt.secret,
    config.jwt.options
  );

  // Set cookie in HTTP response
  res.cookie(config.cookie.name, token, config.cookie.options);
  res.json({ message: 'Login successful', username: username });
};

const logout = async (req, res) => {
  // Read cookie
  const token = req.cookies[config.cookie.name];
  if (!token) {
    return res.status(403).json({ message: 'Already logged out' });
  }

  // Clear cookie from user's browser
  res.clearCookie(config.cookie.name);
  res.json({ message: 'Logout successful' });
};

const getSession = async (req, res) => {
  const username = req.username;

  // Find user details
  const [userRows] = await db.execute('SELECT 1 FROM user WHERE user_username = ? AND user_enabled = 1', [username]);
  if (userRows.length === 0) {
    return res.status(403).json({ message: 'Access denied' });
  }

  // Find user groups
  const [groupRows] = await db.execute('SELECT user_group_groupName as groupName FROM user_group WHERE user_group_username = ?', [username]);
  const groups = groupRows.map(row => row.groupName);

  // Combine details and groups
  res.json({ username, groups });
};


/** PROFILE **/

const getProfile = async (req, res) => {
  const username = req.username;

  // Find user details
  const [rows] = await db.execute('SELECT user_email as email FROM user WHERE user_username = ?', [username]);
  if (rows.length === 0) {
    return res.status(404).json({ message: 'Profile not found' });
  }

  const user = rows[0];
  res.json({ username: username, email: user.email });
};

const updateProfile = async (req, res) => {
  const username = req.username;
  let { password, email } = req.body;

  const clauses = [];

  // Password
  if (password?.length > 0) {
    if (!validatePassword(password)) {
      return res.status(400).json({
        message: 'Password must contain: 8 - 10 characters; only letters (case sensitive), numbers, and special characters; at least one of each'
      });
    }
    clauses.push({ key: 'user_password', value: await bcryptjs.hash(password, config.bcryptjs.saltRounds) });
  }
  // Email
  if (email?.length > 0) {
    clauses.push({ key: 'user_email', value: email });
  }
  // No changes
  if (clauses.length === 0) {
    return res.sendStatus(204);
  }

  const query = `UPDATE user SET ${clauses.map(clause => `${clause.key} = ?`).join(', ')} WHERE user_username = ?`;
  const values = clauses.map(clause => clause.value).concat(username);

  try {
    await db.execute(query, values);
    res.sendStatus(204);

  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile, please try again' });
  }
};


/** USERS **/

const getAllUsers = async (req, res) => {
  // Find user details
  const [users] = await db.execute('SELECT user_username as username, user_email as email, user_enabled as enabled FROM user');

  // Find user groups
  const [groups] = await db.execute('SELECT user_group_username as username, user_group_groupName as groupName FROM user_group');

  // Combine details and groups
  const map = new Map();

  users.forEach(user => {
    user.groups = [];
    map.set(user.username, user.groups);
  });

  groups.forEach(group => {
    map.get(group.username)?.push(group.groupName)
  });

  res.json(users);
};

const createUser = async (req, res) => {
  let { username, password, email, enabled, groups } = req.body;
  username = username.toLowerCase();

  // Username
  if (!validateUsername(username)) {
    return res.status(400).json({
      message: 'Username must contain: 1 - 50 characters; only letters (not case sensitive) or numbers'
    });
  }
  // Password
  if (!validatePassword(password)) {
    return res.status(400).json({
      message: 'Password must contain: 8 - 10 characters; only letters (case sensitive), numbers, and special characters; at least one of each'
    });
  }
  const hashedPassword = await bcryptjs.hash(password, config.bcryptjs.saltRounds);
  const userGroups = groups?.map(group => [username, group]);

  // Create user
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Create user
    await connection.execute(
      'INSERT INTO user (user_username, user_password, user_email, user_enabled) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, email, enabled],
    );

    // Add user groups (if any)
    if (userGroups?.length > 0) {
      await connection.query('INSERT INTO user_group (user_group_username, user_group_groupName) VALUES ?', [userGroups]);
    }

    await connection.commit();
    res.status(201).json({ username });

  } catch (error) {
    await connection.rollback();
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ message: 'Username already exists' });
    } else {
      res.status(500).json({ message: 'Failed to create user, please try again' });
    }

  } finally {
    connection.release();
  }
};

const updateUser = async (req, res) => {
  let { username, password, email, enabled, groups } = req.body;
  username = username.toLowerCase();

  // Protect hardcoded admin
  if (username === config.accounts.admin) {
    if (enabled !== 1 || !groups.includes(config.groups.admin)) {
      return res.status(400).json({ message: 'Admin cannot be disabled or removed from admin group' });
    }
  }

  const clauses = [];

  // Password
  if (password?.length > 0) {
    if (!validatePassword(password)) {
      return res.status(400).json({
        message: 'Password must contain: 8 - 10 characters; only letters (case sensitive), numbers, and special characters; at least one of each'
      });
    }
    clauses.push({ key: 'user_password', value: await bcryptjs.hash(password, config.bcryptjs.saltRounds) });
  }
  // Email
  if (email?.length > 0) {
    clauses.push({ key: 'user_email', value: email });
  }
  // Email
  if (enabled !== undefined) {
    clauses.push({ key: 'user_enabled', value: enabled });
  }
  // No changes
  if (clauses.length === 0) {
    return res.sendStatus(204);
  }

  const query = `UPDATE user SET ${clauses.map(clause => `${clause.key} = ?`).join(', ')} WHERE user_username = ?`;
  const values = clauses.map(clause => clause.value).concat(username);

  const userGroups = groups.map(group => [username, group]);

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [rows] = await connection.execute(query, values);
    if (rows.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove exisiting user groups (if any)
    if (userGroups) {
      await connection.execute('DELETE FROM user_group WHERE user_group_username = ?', [username]);
    }
    // Add user groups (if any)
    if (userGroups?.length > 0) {
      await connection.query('INSERT INTO user_group (user_group_username, user_group_groupName) VALUES ?', [userGroups]);
    }

    await connection.commit();
    res.sendStatus(204);

  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Failed to update profile, please try again' });

  } finally {
    connection.release();
  }
};


/** GROUPS **/

const getAllGroups = async (req, res) => {
  const [rows] = await db.execute('SELECT DISTINCT user_group_groupName as groupName FROM user_group');
  const groups = rows.map(row => row.groupName);
  res.json(groups);
};

const SYSTEM_USERNAME = '$';

const createGroup = async (req, res) => {
  let { group } = req.body;
  group = group.toLowerCase();

  // Group
  if (!validateGroupName(group)) {
    return res.status(400).json({
      message: 'Group name must contain: 1 - 50 characters; only letters (not case sensitive), numbers, or underscores'
    });
  }

  try {
    await db.execute('INSERT INTO user_group (user_group_username, user_group_groupName) VALUES (?, ?)', [SYSTEM_USERNAME, group]);
    res.status(201).json({ group });
  } catch (error) {
    res.status(409).json({ message: 'Group name already exists' });
  }
};


/** VALIDATION **/

const REGEX_USERNAME = /^[A-Za-z\d]{1,50}$/;

function validateUsername(value) {
  return REGEX_USERNAME.test(value ?? '');
}

const REGEX_PASSWORD = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[\W_])[^\s]{8,10}$/;

function validatePassword(value) {
  return REGEX_PASSWORD.test(value ?? '');
}

const REGEX_GROUPNAME = /^[\w]{1,50}$/

function validateGroupName(value) {
  return REGEX_GROUPNAME.test(value ?? '');
}


/** EXPORTS **/

module.exports = {
  // AUTHENTICATION
  login,
  logout,
  getSession,
  // PROFILE
  getProfile,
  updateProfile,
  // USERS
  getAllUsers,
  createUser,
  updateUser,
  // GROUPS
  getAllGroups,
  createGroup,
};
