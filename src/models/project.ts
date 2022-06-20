import { Schema, model } from "mongoose";
import { ProjectDocument } from "./interfaces";

const ProjectSchema = new Schema<ProjectDocument>({
    name:{
        type:String,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status:{
        type: String,
        required: true,
        default: 'PENDING',
        enum: ['PENDING', 'APPROVED', 'COMPLETED', 'CANCELED']
    },
    plan:{
        type: String,
        required: true,
        enum: ['STANDARD', 'PRO', 'ENTERPRISE']
    },
    detail: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    active: {
        type: Boolean,
        required: true,
        default: false
    }
}, {
    timestamps:true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})


const Project = model<ProjectDocument>('Project', ProjectSchema)

export {Project}