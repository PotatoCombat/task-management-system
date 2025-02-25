const router = require('express').Router();

const config = require('../config');

const controller = require('../controllers/userController');
const { getLoginUser, isLoginUserInGroup } = require('../middlewares/userMiddleware');

const isAdminUser = isLoginUserInGroup(config.groups.admin);

/** Authentication **/
router.post('/login', controller.login);
router.post('/logout', controller.logout);
router.get('/get-session', getLoginUser, controller.getSession);

/** Profile **/
router.get('/get-profile', getLoginUser, controller.getProfile);
router.patch('/update-profile', getLoginUser, controller.updateProfile);

/** Users **/
router.get('/get-users', getLoginUser, isAdminUser, controller.getAllUsers);
router.post('/create-user', getLoginUser, isAdminUser, controller.createUser);
router.patch('/update-user', getLoginUser, isAdminUser, controller.updateUser);

/** Groups **/
router.get('/get-groups', getLoginUser, controller.getAllGroups);
router.post('/create-group', getLoginUser, isAdminUser, controller.createGroup);

module.exports = router;
