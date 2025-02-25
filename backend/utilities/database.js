const mysql = require('mysql2/promise');

const config = require('../config');

const db = mysql.createPool(config.db);

module.exports = db;
