const router = require('express').Router();
const controller = require('../controllers/groupController');

router.get('/groups', controller.getAllGroups);
router.post('/group', controller.createGroup);

module.exports = router;
