import axios from "axios";

import config from "@/config";

const api = axios.create(config.backend);

api.interceptors.response.use(
  (response) => {
    console.log(`${response.config.method.toUpperCase()} ${response.config.url} success:`, response);
    return response;
  },
  (error) => {
    console.error(`${error.config.method.toUpperCase()} ${error.config.url} failed:`, error.response);
    return Promise.reject(error);
  }
);

/** AUTH **/

async function login({ username, password }) {
  return api.post('/login', { username, password });
}
async function logout() {
  return api.post('/logout');
}

/** GROUPS **/

async function getAllGroups() {
  return api.get('/groups');
}
async function createGroup({ group }) {
  return api.post('/group', { group });
}

/** PROFILE **/

async function getProfile() {
  return api.get('/profile');
}
async function updateProfile({ password, email }) {
  return api.patch('/profile', { password, email });
}

/** USERS **/

async function getAllUsers() {
  return api.get('/users');
}
async function getUser({ username }) {
  return api.get(`/user/${username}`);
}
async function createUser({ username, password, email, enabled, groups }) {
  return api.post('/user', { username, password, email, enabled, groups });
}
async function updateUser({ username, password, email, enabled, groups }) {
  return api.patch('/user', { username, password, email, enabled, groups });
}

export default {
  login,
  logout,
  getAllGroups,
  createGroup,
  getProfile,
  updateProfile,
  getAllUsers,
  getUser,
  createUser,
  updateUser,
}
