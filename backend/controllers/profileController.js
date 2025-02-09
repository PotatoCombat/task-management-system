const repository = require('../repositories/profileRepository');

const { NotFoundError } = require('../utilities/errors');
const http = require('../utilities/http');
const validation = require('../utilities/validation');

const getProfile = http.asyncHandler(async (req, res) => {
  const username = req.username;

  const profile = await repository.getProfile({ username });
  if (!profile) {
    throw new NotFoundError('Profile not found');
  }
  res.json(profile);
});

const updateProfile = http.asyncHandler(async (req, res) => {
  const username = req.username;
  const { password, email } = req.body;

  // Validate params
  if (password?.length > 0) {
    validation.validatePassword(password);
  }

  // Find profile
  const profile = await repository.getProfile({ username });
  if (!profile) {
    throw new NotFoundError('Profile not found');
  }

  // Update profile
  await repository.updateProfile({ ...req.body, username });
  res.sendStatus(204);
});

module.exports = {
  getProfile,
  updateProfile,
};
