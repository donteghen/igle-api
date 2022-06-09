"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTH_FAILED = exports.ACCOUNT_UNAPPROVED = exports.RESET_TOKEN_DEACTIVED = exports.PASSWORD_INCORRECT = exports.LOGIN_FAILED = exports.INVALID_RESET_TOKEN = exports.WRONG_RESET_TOKEN_TYPE = exports.DELETE_OPERATION_FAILED = exports.SAVE_OPERATION_FAILED = exports.TOKEN_GENERATION_FAILED = exports.NEW_PASSWORD_IS_INVALID = exports.OLD_PASSWORD_IS_INCORRECT = exports.NO_ADMIN = exports.NO_USER = exports.NO_TOKEN = exports.NOT_FOUND = void 0;
exports.NOT_FOUND = {
    name: 'NOT_FOUND',
    message: 'Not found! The requested resource is available'
};
exports.NO_TOKEN = {
    name: 'NO_TOKEN',
    message: 'No token was found!'
};
exports.NO_USER = {
    name: 'NO_USER_FOUND',
    message: 'No user  found with provided information!'
};
exports.NO_ADMIN = {
    name: 'NO_ADMIN_FOUND',
    message: 'No admin found with provided information!'
};
exports.OLD_PASSWORD_IS_INCORRECT = {
    name: 'OLD_PASSWORD_IS_INCORRECT',
    message: 'Your old password is incorrect!'
};
exports.NEW_PASSWORD_IS_INVALID = {
    name: 'NEW_PASSWORD_IS_INVALID',
    message: 'Your new password is invalid!'
};
exports.TOKEN_GENERATION_FAILED = {
    name: 'TOKEN_GENERATION_FAILED',
    message: 'Token generation failed, please try again later!'
};
exports.SAVE_OPERATION_FAILED = {
    name: 'SAVE_OPERATION_FAILED',
    message: 'Document failed to save, please try again.'
};
exports.DELETE_OPERATION_FAILED = {
    name: 'DELETE_OPERATION_FAILED',
    message: 'Document delete operation failed, please try again.'
};
exports.WRONG_RESET_TOKEN_TYPE = {
    name: 'WRONG_RESET_TOKEN_TYPE',
    message: 'password reset operation failed, please try again.'
};
exports.INVALID_RESET_TOKEN = {
    name: 'INVALID_RESET_TOKEN',
    message: 'Reset token is invalid, please try again.'
};
exports.LOGIN_FAILED = {
    name: 'LOGIN_FAILED',
    message: 'Login request failed! Email and/or Password are/is incorrect.'
};
exports.PASSWORD_INCORRECT = {
    name: 'PASSWORD_INCORRECT',
    message: 'Login request failed! Password is incorrect.'
};
exports.RESET_TOKEN_DEACTIVED = {
    name: 'RESET_TOKEN_DEACTIVED',
    message: 'This token is no longer valid!.'
};
exports.ACCOUNT_UNAPPROVED = {
    name: 'ACCOUNT_UNAPPROVED',
    message: 'This token is no longer valid!.'
};
exports.AUTH_FAILED = {
    name: 'AUTHENTICATION FAILED',
    message: 'You must be authenticated to access this feature'
};
//# sourceMappingURL=errors.js.map