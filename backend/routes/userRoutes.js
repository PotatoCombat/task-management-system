const router = require('express').Router();

const userController = require('../controllers/userController');

router.get('/', userController.getUsers);
router.get('/create', userController.createUser);
router.get('/update', userController.updateUser);

module.exports = router;
