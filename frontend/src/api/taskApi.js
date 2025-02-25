import axios from "axios";

import config from "@/config";

const api = axios.create(config.backend);

/** APPLICATION **/

async function getAllApplications() {
  return api.get('/task/get-applications');
}

async function getApplicationPermissions({ acronym }) {
  return api.get(`/task/get-application-permissions/${acronym}`);
}

async function createApplication({ acronym, rNumber, description, startDate, endDate, permitCreate, permitOpen, permitToDo, permitDoing, permitDone }) {
  return api.post('/task/create-application', { acronym, rNumber, description, startDate, endDate, permitCreate, permitOpen, permitToDo, permitDoing, permitDone });
}

async function updateApplication({ acronym, description, startDate, endDate, permitCreate, permitOpen, permitToDo, permitDoing, permitDone }) {
  return api.patch('/task/update-application', { acronym, description, startDate, endDate, permitCreate, permitOpen, permitToDo, permitDoing, permitDone });
}

/** PLANS **/

async function getAllPlans({ application }) {
  return api.get(`/task/get-plans/${application}`);
}

async function createPlan({ application, name, startDate, endDate, color }) {
  return api.post(`/task/create-plan`, { name, application, startDate, endDate, color });
}

/** TASKS **/

async function getAllTasks({ application }) {
  return api.get(`/task/get-tasks/${application}`);
}

async function getTask({ taskId }) {
  return api.get(`/task/get-task/${taskId}`);
}

async function createTask({ application, name, plan, description }) {
  return api.post(`/task/create-task`, { name, application, plan, description });
}

async function releaseTask({ taskId }) {
  return api.post(`/task/release-task`, { id: taskId });
}

async function workOnTask({ taskId }) {
  return api.post(`/task/work-on-task`, { id: taskId });
}

async function returnTask({ taskId }) {
  return api.post(`/task/return-task`, { id: taskId });
}

async function seekApprovalTask({ taskId }) {
  return api.post(`/task/seek-approval-task`, { id: taskId });
}

async function requestExtensionTask({ taskId }) {
  return api.post(`/task/seek-approval-task`, { id: taskId, requestExtension: true });
}

async function rejectTask({ taskId }) {
  return api.post(`/task/reject-task`, { id: taskId });
}

async function approveTask({ taskId }) {
  return api.post(`/task/approve-task`, { id: taskId });
}

async function updateTaskPlan({ taskId, plan }) {
  return api.patch(`/task/update-task-plan`, { id: taskId, plan });
}

async function addTaskNote({ taskId, note }) {
  return api.patch(`/task/add-task-note`, { id: taskId, text: note });
}

export default {
  // APPLICATIONS
  getAllApplications,
  getApplicationPermissions,
  createApplication,
  updateApplication,
  // PLANS
  getAllPlans,
  createPlan,
  // TASKS
  getAllTasks,
  getTask,
  createTask,
  releaseTask,
  workOnTask,
  returnTask,
  seekApprovalTask,
  requestExtensionTask,
  rejectTask,
  approveTask,
  updateTaskPlan,
  addTaskNote,
};
