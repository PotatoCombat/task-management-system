const config = require('../config');

const repository = require('../repositories/userRepository');

const { BadRequestError, ConflictError, NotFoundError } = require('../utilities/errors');
const http = require('../utilities/http');
const validation = require('../utilities/validation');

const getAllUsers = http.asyncHandler(async (req, res) => {
  const users = await repository.getAllUsers();
  res.json(users);
});

const getUser = http.asyncHandler(async (req, res) => {
  const username = req.params.username?.toLowerCase();

  const user = await repository.getUser({ username });
  if (!user) {
    throw new NotFoundError('User not found');
  }
  res.json(user);
});

const createUser = http.asyncHandler(async (req, res) => {
  const { username, password, email, enabled, groups } = req.body;

  // Validate params
  validation.validateUsername(username);
  validation.validatePassword(password);

  // Create user
  const newUser = await repository.createUser(req.body);
  if (!newUser) {
    throw new ConflictError('Username already exists');
  }
  res.status(201).json(newUser);
});

const updateUser = http.asyncHandler(async (req, res) => {
  const { username, password, email, enabled, groups } = req.body;

  // Protect hardcoded admin
  if (username === config.accounts.admin) {
    if (!enabled || !groups.includes(config.groups.admin)) {
      throw new BadRequestError('Admin cannot be disabled or removed from admin group');
    }
  }

  // Validate params
  validation.validateUsername(username);
  if (password?.length > 0) {
    validation.validatePassword(password);
  }

  // Find user
  const user = await repository.getUser({ username });
  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Update user
  await repository.updateUser(req.body);
  res.sendStatus(204);
});

module.exports = {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
};
