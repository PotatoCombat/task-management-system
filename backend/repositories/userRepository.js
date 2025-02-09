const db = require('../utilities/database');
const security = require('../utilities/security');
const sql = require('../utilities/sql');

const getAllUsers = async () => {
  // Find user details
  const [userRows] = await db.execute(`
    SELECT user_username as username,
           user_email as email,
           user_enabled as enabled
    FROM users
    ORDER BY username
  `);

  // Find user groups
  const [groupRows] = await db.execute(`
    SELECT user_group_username as username,
           user_group_groupName as groupName
    FROM user_group
    ORDER BY groupName
  `);

  // Combine details and groups
  const result = userRows.map(user => ({ ...user, groups: [] }));

  const map = new Map();
  result.forEach(user => map.set(user.username, user.groups));

  groupRows.forEach(group => map.get(group.username)?.push(group.groupName));

  return result;
}

const getUser = async ({ username }) => {
  // Find user details
  const [userRows] = await db.execute(`
      SELECT user_username as username,
             user_email as email,
             user_enabled as enabled
      FROM users
      WHERE user_username = ?
    `,
    [username]
  );

  // User not found
  if (userRows.length === 0) {
    return null;
  }

  // Find user groups
  const [groupRows] = await db.execute(`
      SELECT user_group_groupName as groupName
      FROM user_group
      WHERE user_group_username = ?
    `,
    [username]
  );

  // Combine details and groups
  const user = userRows[0];
  const groups = groupRows.map(row => row.groupName);

  return { ...user, groups };
}

const createUser = async ({ username, password, email = null, enabled = 1, groups = [] }) => {
  return db.executeTransaction(async (connection) => {
    // Transform params
    const hashedPassword = await security.createHash(password);

    // Create user
    await connection.execute(
      'INSERT INTO users (user_username, user_password, user_email, user_enabled) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, email, enabled],
    );

    // Add user groups (if any)
    if (groups?.length > 0) {
      const values = groups.map(group => [username, group]);
      await connection.query(
        'INSERT INTO user_group (user_group_username, user_group_groupName) VALUES ?',
        [values]
      );
    }

    return { username, email, enabled, groups };
  });
}

const updateUser = async({ username, password, email, enabled, groups }) => {
  return db.executeTransaction(async (connection) => {
    // Chain optional update params
    const updateUserBuilder = sql.update('users').where('user_username', username);
    if (password?.length > 0) {
      updateUserBuilder.set('user_password', await security.createHash(password));
    }
    if (email?.length > 0) {
      updateUserBuilder.set('user_email', email);
    }
    if (enabled !== undefined) {
      updateUserBuilder.set('user_enabled', enabled);
    }
    const [updateUserQuery, updateUserValues] = updateUserBuilder.build();

    // Update user
    if (updateUserQuery) {
      await connection.execute(updateUserQuery, updateUserValues);
    }

    // Clear existing user groups
    if (groups) {
      await connection.execute(
        'DELETE FROM user_group WHERE user_group_username = ?',
        [username],
      );
    }

    // Add user groups (if any)
    if (groups?.length > 0) {
      const values = groups.map(group => [username, group]);
      await connection.query(
        'INSERT INTO user_group (user_group_username, user_group_groupName) VALUES ?',
        [values]
      );
    }

    return true;
  });
}

module.exports = {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
};
