const { ValidationError } = require("./errors");

const DEFAULT_REGEX = /.*/;
const ALL_SPACES = /[\s]+/g;

function validateString(value, options) {
  const {
    type = 'value',
    regex = DEFAULT_REGEX,
    errorMessage,
  } = options;

  const code = `INVALID_${type.toUpperCase().replace(ALL_SPACES, '_')}`;

  if (typeof value !== 'string') {
    throw new ValidationError(`${type} must be a string`, code);
  }
  if (!regex.test(value)) {
    throw new ValidationError(`${type} must contain: ${errorMessage}`, code);
  }
  return true;
}

const USERNAME_OPTIONS = {
  type: 'username',
  regex: /^[A-Za-z\d]{1,50}$/,
  errorMessage: '1 - 50 characters; not case sensitive; only letters or numbers',
};

function validateUsername(value) {
  return validateString(value, USERNAME_OPTIONS);
}

const PASSWORD_OPTIONS = {
  type: 'password',
  regex: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[\W_])[^\s]{8,10}$/,
  errorMessage: '8 - 10 characters; case sensitive; only letters, numbers, special characters; at least one of each',
};

function validatePassword(value) {
  return validateString(value, PASSWORD_OPTIONS);
}

const GROUPNAME_OPTIONS = {
  type: 'group name',
  regex: /^[\w]{1,50}$/,
  errorMessage: '1 - 50 characters; not case sensitive; only letters, numbers, or underscores',
};

function validateGroupName(value) {
  return validateString(value, GROUPNAME_OPTIONS);
}

module.exports = {
  validateUsername,
  validatePassword,
  validateGroupName,
}
