const db = require('../utilities/database');

async function getHashedPassword({ username }) {
  const [rows] = await db.execute(
    'SELECT user_password FROM users WHERE user_username = ?',
    [username]
  );
  if (rows.length === 0) {
    return null;
  }
  return { hashedPassword: rows[0].user_password };
}

async function checkGroup(username, group) {
  if (!username || !group) {
    return { result: false };
  }
  const [rows] = await db.execute(
    'SELECT 1 FROM user_group WHERE user_group_username = ? AND user_group_groupName = ?',
    [username, group]
  );
  return { result: rows.length > 0 };
}

module.exports = {
  getHashedPassword,
  checkGroup,
};
