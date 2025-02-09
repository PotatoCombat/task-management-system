const db = require('../utilities/database');

const BLANK_USERNAME = '$';

const getAllGroups = async () => {
  const [rows] = await db.execute(`
    SELECT DISTINCT user_group_groupName as groupName
    FROM user_group
    ORDER BY groupName
  `);

  return rows.map(row => row.groupName);
}

const createGroup = async ({ group }) => {
  return db.executeTransaction(async (connection) => {
    // Create group
    await connection.execute(
      'INSERT INTO user_group (user_group_username, user_group_groupName) VALUES (?, ?)',
      [BLANK_USERNAME, group],
    );

    return { group };
  });
}

module.exports = {
  getAllGroups,
  createGroup,
};
