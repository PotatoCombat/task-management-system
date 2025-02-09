const bcryptjs = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config');

function createSecret(length) {
  return crypto.randomBytes(length).toString('base64');
}

async function createHash(password, saltRounds = 10) {
  const salt = await bcryptjs.genSalt(saltRounds);
  const hash = await bcryptjs.hash(password, salt);
  return hash;
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

module.exports = {
  createSecret,
  createHash,
  verifyHash,
  createJwt,
  decodeJwt,
}
