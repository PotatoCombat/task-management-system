const repository = require('../repositories/userRepository');

const security = require('../utilities/security');

async function getAllUsers(req, res) {
  try {
    const users = await repository.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching users');
  }
}

async function getUser(req, res) {
  try {
    const user = await repository.getUser(req.body);
    if (user) {
      res.json(user);
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching user');
  }
}

async function createUser(req, res) {
  const { username, password, email, enabled, groups } = req.body;

  // TODO: Validate password
  const hashedPassword = await security.createHash(password);

  try {
    const newUser = await repository.createUser({ username, hashedPassword, email, enabled, groups });
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating user');
  }
}

async function updateUser(req, res) {
  const { username, password, email, enabled, groups } = req.body;

  // TODO: Validate password
  const hashedPassword = await security.createHash(password);

  try {
    const updatedUser = await repository.updateUser({ username, hashedPassword, email, enabled, groups });
    if (updatedUser) {
      res.json(updatedUser);
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating user');
  }
}

module.exports = {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
};
