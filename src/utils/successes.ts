import {ISuccessMessage} from '../models/interfaces'

export const CREATED_SUCCESSFULLY: ISuccessMessage = {
    ok: true,
    message: 'Great! SuccessFully created'
}

export const DELETED_SUCCESSFULLY: ISuccessMessage = {
    ok: true,
    message: 'Delete Operation was successful'
}
export const PASSWORD_RESET_SUCCESSFUL: ISuccessMessage ={
    ok: true,
    message: 'Password was successfully reset'
}