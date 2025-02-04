const db = require('../utilities/database');

async function getProfile({ username }) {
  const [userRows] = await db.execute(
    'SELECT * FROM users WHERE user_username = ?',
    [username]
  );

  // Check user exists
  if (userRows.length === 0) {
    return null;
  }

  const [groupRows] = await db.execute(
    'SELECT user_group_groupName FROM user_group WHERE user_group_username = ?',
    [username]
  );

  const user = userRows[0];
  const groups = groupRows.map(row => row.user_group_groupName);

  return {
    username: user.user_username,
    email: user.user_email,
    groups: groups
  };
}

async function updateProfile({ username, hashedPassword, email }) {
  // Check user exists
  const [rows] = await db.execute(
    'SELECT 1 FROM users WHERE user_username = ?',
    [username]
  );
  if (rows.length === 0) {
    return null;
  }

  // TODO: Build update query

  // Update the user
  if (hashedPassword.length > 0) {
    const [result] = await db.execute(
      'UPDATE users SET user_email = ?, user_password = ? WHERE user_username = ?',
      [email, hashedPassword, username]
    );
  } else {
    const [result] = await db.execute(
      'UPDATE users SET user_email = ? WHERE user_username = ?',
      [email, username]
    );
  }

  return { username, email };
}

module.exports = {
  getProfile,
  updateProfile,
};
