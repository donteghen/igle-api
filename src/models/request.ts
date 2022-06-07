import { Schema, model } from "mongoose";
import { RequestDocument } from "./interfaces";

const RequestSchema = new Schema<RequestDocument>({
    sender: {
        type: Schema.Types.ObjectId,
        ref:'User',
        required: true,
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
    request_type: {
        type: String,
        required: true,
        enum:['360VR', 'PLAN UPGRADE', 'UPDATED REPORT', 'OTHERS']
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

const ProjectRequest = model<RequestDocument>('Request', RequestSchema)

export {ProjectRequest}