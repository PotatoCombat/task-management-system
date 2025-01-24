const bcryptjs = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

function create_secret(length) {
  return crypto.randomBytes(length).toString('base64');
}

async function create_hash(password, saltRounds = 10) {
  try {
    const salt = await bcryptjs.genSalt(saltRounds);
    const hash = await bcryptjs.hash(password, salt);
    return hash;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function verify_hash(password, hash) {
  return bcryptjs.compare(password, hash);
}

const jwtSecretKey = process.env.JWT_SECRET_KEY;
const jwtExpiry = process.env.JWT_EXPIRY;

function create_jwt(ip, browser_type, username) {
  const token = jwt.sign(
    {
      ip,
      browser_type,
      username
    },
    jwtSecretKey,
    { expiresIn: jwtExpiry }
  );
  return token;
}

function decode_jwt(token) {
  return jwt.verify(token, jwtSecretKey, (err, decoded) => {
    return err ? null : decoded;
  });
}

module.exports = {
  create_secret,
  create_hash,
  verify_hash,
  create_jwt,
  decode_jwt,
}
