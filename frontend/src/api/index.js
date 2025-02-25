import taskApi from './taskApi';
import userApi from './userApi';

export default {
  ...taskApi,
  ...userApi,
};
