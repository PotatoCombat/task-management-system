const db = require('../utilities/database');

async function getAllUsers() {
  const [userRows] = await db.execute(
    'SELECT * FROM users ORDER BY user_username',
  );

  const [groupRows] = await db.execute(
    'SELECT * FROM user_group ORDER BY user_group_groupName',
  );

  const result = userRows.map(row => ({
    username: row.user_username,
    email: row.user_email,
    enabled: row.user_enabled,
    groups: []
  }));

  const map = new Map();
  result.forEach(user => {
    map.set(user.username, user.groups)
  });
  groupRows.forEach(row => {
    map.get(row.user_group_username)?.push(row.user_group_groupName);
  });

  return result;
}

async function getUser({ username }) {
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
    enabled: user.user_enabled,
    groups: groups
  };
}

async function createUser({ username, hashedPassword, email, enabled, groups }) {
  const connection = await db.getConnection();
  try {
    // Start a transaction
    await connection.beginTransaction();

    // Create the user
    const [userResult] = await connection.execute(
      'INSERT INTO users (user_username, user_password, user_email, user_enabled) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, email, enabled],
    );

    // Add user groups (if any)
    if (groups && groups.length > 0) {
      const values = groups.map(group => [username, group]);
      const [groupResult] = await connection.query(
        'INSERT INTO user_group (user_group_username, user_group_groupName) VALUES ?',
        [values]
      );
    }

    await connection.commit();
    return { username, email, enabled, groups };

  } catch (error) {
    await connection.rollback();
    throw error;

  } finally {
    connection.release();
  }
}

async function updateUser({ username, hashedPassword, email, enabled, groups }) {
  // Check user exists
  const [userRows] = await db.execute(
    'SELECT 1 FROM users WHERE user_username = ?',
    [username]
  );
  if (userRows.length === 0) {
    return null;
  }

  // TODO: Build update query

  const connection = await db.getConnection();
  try {
    // Start a transaction
    await connection.beginTransaction();

    // Update the user
    const [userResult] = await connection.execute(
      'UPDATE users SET user_password = ?, user_email = ?, user_enabled = ? WHERE user_username = ?',
      [hashedPassword, email, enabled, username]
    );

    // Clear existing user groups
    if (groups) {
      const [deleteGroupResult] = await connection.execute(
        'DELETE FROM user_group WHERE user_group_username = ?',
        [username],
      );
    }

    // Add user groups (if any)
    if (groups && groups.length > 0) {
      const values = groups.map(group => [username, group]);
      const [groupResult] = await connection.query(
        'INSERT INTO user_group (user_group_username, user_group_groupName) VALUES ?',
        [values]
      );
    }

    await connection.commit();
    return { username, email, enabled, groups };

  } catch (error) {
    await connection.rollback();
    throw error;

  } finally {
    connection.release();
  }
}

module.exports = {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
};
