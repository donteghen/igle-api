import {Schema, Model, model } from "mongoose";
import isEmail from 'validator/lib/isEmail'
import isStrongPassword from 'validator/lib/isStrongPassword'
import bcrypt from 'bcrypt'
import {sign} from 'jsonwebtoken'
import {NO_USER, PASSWORD_INCORRECT, NO_TOKEN } from '../utils/errors'
import {IError, UserDocument} from '../models/interfaces'


interface IUser extends UserDocument {
    generateUserSession: () => string,
    toJSON: () => any
}

interface UserModel extends Model<IUser> {
    getUserWithCredentials: (name: string, password: string) => IUser
}


const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        validate: {
            validator (value: string) {
                return isEmail(value)
            },
            message: 'Provided email is invalid!'
        }
    },
    password: {
        type: String,
        required: true,
        validate: {
            validator (value: string){
                return isStrongPassword(value, {
                    minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1
                })
            },
            message () {
               return `password is not strong enough`
            }
        }
    },
    tokens: {
        type: [String],
        required: true
    },
    avatarDeleteId : {
        type: String,
    },
    avatar: {
        type: String,
    },
    phone_number: {
        type: String,
    },
    bio: {
        type: String,
    },
    isAdmin:{
        type: Boolean,
        required:true,
        default: false
    }
}, {
    timestamps:true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

UserSchema.pre('save', async function(next){
    const user = this;
    if (user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

UserSchema.statics.getUserWithCredentials = async function (email: string, password: string){

    const user = await User.findOne({email});
    if(!user){
        let error: IError = new Error()
        error = NO_USER
        throw error
    }
    const isMatched = await bcrypt.compare(password, user.password);

    if (!isMatched){
        let error: IError = new Error()
        error = PASSWORD_INCORRECT
        throw error
    }
    return user
}

UserSchema.methods.generateUserSession = async function(){
    const user = this;
    const token = sign({_id:user._id.toString()}, process.env.JWT_SECRET)

    if(!token){
        let error: IError = new Error()
        error = NO_TOKEN
        throw error
    }
    user.tokens = user.tokens.concat(token)

    await user.save()
    return token;
}
UserSchema.methods.toJSON = function(){
    const user = this;
    const userObject = user.toObject()
    delete userObject.avatarDeleteId;
    delete userObject.password;
    delete userObject.tokens;
    return userObject;
}
const User: UserModel = model<IUser, UserModel>('Users', UserSchema)

export {User, IUser, UserModel}