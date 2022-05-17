import { Schema, model } from "mongoose";
import { RequestDocument } from "./interfaces";

const RequestSchema = new Schema<RequestDocument>({
    sender: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    project: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    request_type: {
        type: String,
        required: true,
        enum:['360VR', 'PLAN UPGRADE', 'UPDATED REPORT']
    },
    detail: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        default: 'RECIEVED',
        enum: ['RECIEVED', 'IN_PROGRESS', 'PROCESSED']
    }
}, {
    timestamps:true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

const Request = model<RequestDocument>('Requests', RequestSchema)

export {Request}