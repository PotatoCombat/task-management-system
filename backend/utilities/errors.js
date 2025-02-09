class AppError extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status || 500;
    this.code = code || 'GENERAL_ERROR';
  }
}

class AuthenticationError extends AppError {
  constructor(message, code = 'AUTH_ERROR') {
    super(403, message, code);
  }
}

class BadRequestError extends AppError {
  constructor(message, code = 'BAD_REQUEST') {
    super(400, message, code);
  }
}

class ConflictError extends AppError {
  constructor(message, code = 'CONFLICT_ERROR') {
    super(409, message, code);
  }
}

class DatabaseError extends AppError {
  constructor(message, code = 'DATABASE_ERROR') {
    super(500, message, code);
  }
}

class NotFoundError extends AppError {
  constructor(message, code = 'NOT_FOUND') {
    super(404, message, code);
  }
}

class ValidationError extends AppError {
  constructor(message, code = 'VALIDATION_ERROR') {
    super(400, message, code);
  }
}

module.exports = {
  AppError,
  AuthenticationError,
  BadRequestError,
  ConflictError,
  DatabaseError,
  NotFoundError,
  ValidationError,
};
