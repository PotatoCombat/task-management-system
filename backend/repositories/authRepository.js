const db = require('../utilities/database');

const getCredentials = async ({ username }) => {
  const [rows] = await db.execute(`
      SELECT user_password as hashedPassword,
             user_enabled as enabled
      FROM users
      WHERE user_username = ?
    `,
    [username]
  );
  // User not found
  if (rows.length === 0) {
    return null;
  }
  return rows[0];
}

const isEnabled = async ({ username }) => {
  const [rows] = await db.execute(
    'SELECT user_enabled enabled FROM users WHERE user_username = ?',
    [username]
  );
  return rows.length > 0 && rows[0].enabled === 1;
}

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
  getCredentials,
  isEnabled,
  checkGroup,
};
