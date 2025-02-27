const config = require('../config');

const mysql = require('mysql2/promise');

const db = mysql.createPool(config.db);

module.exports = db;
