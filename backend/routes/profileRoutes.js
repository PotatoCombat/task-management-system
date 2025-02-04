const router = require('express').Router();
const controller = require('../controllers/profileController');

router.get('/profile', controller.getProfile);
router.patch('/profile', controller.updateProfile);

module.exports = router;
