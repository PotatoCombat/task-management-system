const router = require('express').Router();
const controller = require('../controllers/userController');

router.get('/users', controller.getAllUsers);
router.get('/user', controller.getUser);
router.post('/user', controller.createUser);
router.patch('/user', controller.updateUser);

module.exports = router;
