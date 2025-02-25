const router = require('express').Router();

const config = require('../config');

const controller = require('../controllers/taskController');
const { getLoginUser, isLoginUserInGroup } = require('../middlewares/userMiddleware');

const isProjectLeadUser = isLoginUserInGroup(config.groups.pl);
const isProjectManagerUser = isLoginUserInGroup(config.groups.pm);

/** Applications **/
router.get('/get-applications', getLoginUser, controller.getAllApplications);
router.get('/get-application-permissions/:application', getLoginUser, controller.getApplicationPermissions);
router.post('/create-application', getLoginUser, isProjectLeadUser, controller.createApplication);
router.patch('/update-application', getLoginUser, isProjectLeadUser, controller.updateApplication);

/** Plans **/
router.get('/get-plans/:application', getLoginUser, controller.getAllPlans);
router.post('/create-plan', getLoginUser, isProjectManagerUser, controller.createPlan);

/** Tasks **/
router.get('/get-tasks/:application', getLoginUser, controller.getAllTasks);
router.get('/get-task/:taskId', getLoginUser, controller.getTask);

router.post('/create-task', getLoginUser, controller.createTask);
router.post('/release-task', getLoginUser, controller.promoteTask2ToDo);
router.post('/work-on-task', getLoginUser, controller.promoteTask2Doing);
router.post('/return-task', getLoginUser, controller.demoteTask2ToDo);
router.post('/seek-approval-task', getLoginUser, controller.promoteTask2Done);
router.post('/reject-task', getLoginUser, controller.demoteTask2Doing);
router.post('/approve-task', getLoginUser, controller.promoteTask2Closed);

router.patch('/update-task-plan', getLoginUser, controller.updateTaskPlan);
router.patch('/add-task-note', getLoginUser, controller.addTaskNote);

module.exports = router;
