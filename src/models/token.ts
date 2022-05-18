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
}, {
    timestamps:true,
    toJSON: { virtuals: true },
  toObject: { virtuals: true }
})
TokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 })
const Token = model<TokenDocument>('Tokens', TokenSchema)
export {Token}