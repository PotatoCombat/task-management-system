import axios from "axios";

import config from "@/config";

const api = axios.create(config.backend);

/** AUTH **/

async function login({ username, password }) {
  return api.post('/user/login', { username, password });
}
async function logout() {
  return api.post('/user/logout');
}
async function getSession() {
  return api.get('/user/get-session');
}

/** PROFILE **/

async function getProfile() {
  return api.get('/user/get-profile');
}
async function updateProfile({ password, email }) {
  return api.patch('/user/update-profile', { password, email });
}

/** USERS **/

async function getAllUsers() {
  return api.get('/user/get-users');
}
async function createUser({ username, password, email, enabled, groups }) {
  return api.post('/user/create-user', { username, password, email, enabled, groups });
}
async function updateUser({ username, password, email, enabled, groups }) {
  return api.patch('/user/update-user', { username, password, email, enabled, groups });
}

/** GROUPS **/

async function getAllGroups() {
  return api.get('/user/get-groups');
}
async function createGroup({ group }) {
  return api.post('/user/create-group', { group });
}

export default {
  // AUTHENTICATION
  login,
  logout,
  getSession,
  // PROFILE
  getProfile,
  updateProfile,
  // USERS
  getAllUsers,
  createUser,
  updateUser,
  // GROUPS
  getAllGroups,
  createGroup,
};
