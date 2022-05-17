import { ContactDocument } from "./interfaces";
import { Schema, model } from "mongoose";
import isEmail from 'validator/lib/isEmail'

const ContactSchema = new Schema<ContactDocument>({
    name:{
        type:String,
        required: true
    },
    email: {
        type: String,
        required: true,
        validate: {
            validator (value: string){
                return isEmail(value)
            },
            message () {
               return `email validation failed!`
            }
        }
    },
    subject:{
        type: String,
        required: true
    },
    message:{
        type: String,
        required: true
    },
    replied: {
        type: Boolean,
        required: true,
        default:false
    }
}, {
    timestamps:true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

const Contact = model<ContactDocument>('Contacts', ContactSchema)

export {Contact}