const repository = require('../repositories/profileRepository');

const security = require('../utilities/security');

async function getProfile(req, res) {
  const username = req.username;

  // Missing params
  if (!username) {
    return res.status(400).send('Not logged in');
  }

  try {
    const profile = await repository.getProfile({ username });
    if (profile) {
      res.json(profile);
    } else {
      res.status(404).send('Profile not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching profile');
  }
}

async function updateProfile(req, res) {
  const username = req.username;
  const { password = '', email } = req.body;

  // Missing params
  if (!username) {
    return res.status(400).send('Not logged in');
  }

  // TODO: Validate password
  const hashedPassword = password.length > 0
    ? await security.createHash(password)
    : '';

  try {
    const updatedProfile = await repository.updateProfile({ username, hashedPassword, email });
    if (updatedProfile) {
      res.json(updatedProfile);
    } else {
      res.status(404).send('Profile not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating profile');
  }
}

module.exports = {
  getProfile,
  updateProfile,
};
