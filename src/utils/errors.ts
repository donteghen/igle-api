import {IError} from '../models/interfaces'

export const NOT_FOUND: IError = {
    name:'NOT_FOUND',
    message: 'Not found! Please again later'
}
export const NO_TOKEN: IError = {
    name:'NO_TOKEN',
    message: 'No token was found!'
}
export const NO_USER: IError = {
    name: 'NO_USER_FOUND',
    message: 'No user  found with provided information!'
}

export const NO_ADMIN: IError = {
    name: 'NO_ADMIN_FOUND',
    message: 'No admin found with provided information!'
}


export const TOKEN_GENERATION_FAILED: IError = {
    name: 'TOKEN_GENERATION_FAILED',
    message: 'Token generation failed, please try again later!'
}

export const SAVE_OPERATION_FAILED: IError = {
    name: 'SAVE_OPERATION_FAILED',
    message:'Document failed to save, please try again.'
}

export const DELETE_OPERATION_FAILED: IError = {
    name: 'DELETE_OPERATION_FAILED',
    message:'Document delete operation failed, please try again.'
}

export const WRONG_RESET_TOKEN_TYPE: IError = {
    name: 'WRONG_RESET_TOKEN_TYPE',
    message:'password reset operation failed, please try again.'
}

export const INVALID_RESET_TOKEN: IError = {
    name: 'INVALID_RESET_TOKEN',
    message:'Reset token is invalid, please try again.'
}

export const LOGIN_FAILED: IError = {
    name: 'LOGIN_FAILED',
    message:'Login request failed! Email and/or Password are/is incorrect.'
}

export const PASSWORD_INCORRECT: IError = {
    name: 'PASSWORD_INCORRECT',
    message:'Login request failed! Password is incorrect.'
}
export const RESET_TOKEN_DEACTIVED: IError = {
    name: 'RESET_TOKEN_DEACTIVED',
    message:'This token is no longer valid!.'
}

export const ACCOUNT_UNAPPROVED: IError = {
    name: 'ACCOUNT_UNAPPROVED',
    message:'This token is no longer valid!.'
}

export const AUTH_FAILED: IError = {
    name: 'AUTHENTICATION FAILED',
    message: 'You must be authenticated to access this feature'
}