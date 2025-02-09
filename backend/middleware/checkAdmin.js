const config = require('../config');

const authRepository = require('../repositories/authRepository');

const { AuthenticationError } = require('../utilities/errors');
const http = require('../utilities/http');

const checkAdmin = http.asyncHandler(async (req, res, next) => {
  const result = await authRepository.checkGroup(req.username, config.groups.admin);
  if (!result) {
    throw new AuthenticationError('Access denied');
  }
  next();
});

module.exports = checkAdmin;
