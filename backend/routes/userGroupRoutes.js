const router = require('express').Router();

const userGroupController = require('../controllers/userGroupController');

router.get('/', userGroupController.getUserGroups);
router.get('/names', userGroupController.getUserGroupNames);
router.get('/auth', userGroupController.getUserGroup);
router.get('/create', userGroupController.createUserGroup);
router.get('/update', userGroupController.updateUserGroup);

module.exports = router;
