const userRepository = require('../repositories/userRepository');

async function getProfile({ username }) {
  return userRepository.getUser({ username });
}

async function updateProfile({ username, password, email }) {
  return userRepository.updateUser({ username, password, email });
}

module.exports = {
  getProfile,
  updateProfile,
};
