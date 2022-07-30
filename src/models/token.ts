import {Schema, model, Model, Document} from 'mongoose'
import { TokenDocument } from './interfaces'

const TokenSchema = new Schema<TokenDocument>({
    owner: {
        type: String,
        required: true
    },
    secret: {
        type: String,
        required: true
    },
    createdAt: {
        type: Number,
        default: Date.now(),
    }
})
TokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 })
const Token = model<TokenDocument>('Token', TokenSchema)
export {Token}