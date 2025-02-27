const router = require('express').Router();

const controller = require('../controllers');

router.post('/CreateTask', controller.CreateTask);
router.post('/GetTaskbyState', controller.GetTaskbyState);
router.patch('/PromoteTask2Done', controller.PromoteTask2Done);

router.all('/*', (req, res) => res.status(404).send('Invalid URL'));

module.exports = router;
