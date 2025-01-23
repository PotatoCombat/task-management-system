const router = require('express').Router();

const authController = require('../controllers/authController');

router.get('/', authController.login);

module.exports = router;
