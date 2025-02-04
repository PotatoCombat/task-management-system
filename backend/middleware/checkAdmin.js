const config = require('../config')
const authRepository = require('../repositories/authRepository');

async function checkAdmin(req, res, next) {
  try {
    const { result } = await authRepository.checkGroup(req.username, config.groups.admin);
    if (result) {
      next();
    } else {
      res.status(404).send('Access denied');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error checking admin');
  }
}

module.exports = checkAdmin;
