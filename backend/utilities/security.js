const bcryptjs = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config');

function createSecret(length) {
  return crypto.randomBytes(length).toString('base64');
}

async function createHash(password, saltRounds = 10) {
  try {
    const salt = await bcryptjs.genSalt(saltRounds);
    const hash = await bcryptjs.hash(password, salt);
    return hash;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function verifyHash(password, hash) {
  return bcryptjs.compare(password, hash);
}

function createJwt(ip, browserType, username) {
  return jwt.sign(
    { ip, browserType, username },
    config.jwt.secret,
    config.jwt.options
  );
}

function decodeJwt(token) {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    return null;
  }
}

function isValidPassword(password) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
}

module.exports = {
  createSecret,
  createHash,
  verifyHash,
  createJwt,
  decodeJwt,
}
