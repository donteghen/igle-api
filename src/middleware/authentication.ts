import {JwtPayload, verify} from 'jsonwebtoken'
import {Request, Response, NextFunction} from 'express'
import { User } from '../models/user'
import { AUTH_FAILED} from '../utils/errors'
import {IError} from '../models/interfaces'


declare module 'jsonwebtoken' {
    export interface JwtPayload {
        _id: string
    }
}

const getPayloadId = function (payload: JwtPayload | string): string {
    if(typeof payload !== 'string'){
        if ('_id' in payload){
            return payload._id
        }
    }
}

// user authentication helper function
export const userAuth = async function (req: Request, res: Response, next:NextFunction) {
    try {
        const token = req.headers['authorization']?.replace('Bearer ', '')
        // console.log(token)
    if (!token) {
        let error: IError = new Error()
        error = AUTH_FAILED
        throw error
    }
    const decode = verify(token, process.env.JWT_SECRET);

    const _id = getPayloadId(decode)
    const user = await User.findOne({_id, tokens:token});
    if (!user) {
        let error: IError  = new Error()
        error = AUTH_FAILED
        throw error
    }
        req.userId = user._id;
        req.token = token;
        next()
    } catch (error) {
        res.status(401).send({ok:false, error:error.message})
    }

}

// user account verification helper function
export const userVerified = async function (req: Request, res: Response, next:NextFunction) {
    try {
        const user = await User.findOne({_id:req.userId, tokens:req.token});
        if (!user) {
        let error: IError  = new Error()
        error = AUTH_FAILED
        throw error
        }
        if(!user.isVerified) {
            throw new Error('You account has not been verified yet! Please check your email and follow the attached link to complete the verification process.')
        }
        next()
    } catch (error) {
        res.status(401).send({ok:false, error:error.message})
    }

}

// Admin authentication helper function
export const adminAuth = async function (req: Request, res: Response, next:NextFunction) {
    try {
        const user = await User.findOne({_id:req.userId, tokens:req.token});
       if (!user) {
        let error: IError  = new Error()
        error = AUTH_FAILED
        throw error
       }
       if(!user.isAdmin) {
            throw new Error('Admin access restricted!')
       }
        next()
    } catch (error) {
        res.status(401).send({ok:false, error:error.message})
    }
}

