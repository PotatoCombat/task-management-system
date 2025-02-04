const db = require('../utilities/database');

const BLANK_USERNAME = '_';

async function getAllGroups() {
  const [rows] = await db.execute(
    'SELECT DISTINCT user_group_groupName FROM user_group ORDER BY user_group_groupName'
  );
  return rows.map(row => row.user_group_groupName);
}

async function createGroup({ group }) {
  const [result] = await db.execute(
    'INSERT INTO user_group (user_group_username, user_group_groupName) VALUES (?, ?)',
    [BLANK_USERNAME, group],
  );
  return { group };
}

module.exports = {
  getAllGroups,
  createGroup,
};
