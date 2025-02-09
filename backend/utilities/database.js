const mysql = require('mysql2/promise');

const config = require('../config');

const db = mysql.createPool(config.db);

// Handle connections for transactions
db.executeTransaction = async function(callback) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;

  } catch (error) {
    await connection.rollback();
    if (error.code === 'ER_DUP_ENTRY') {
      return null;
    }
    throw error;

  } finally {
    connection.release();
  }
}

module.exports = db;
