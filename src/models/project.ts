import { Schema, model } from "mongoose";
import { ProjectDocument } from "./interfaces";

const ProjectSchema = new Schema<ProjectDocument>({
    name:{
        type:String,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    status:{
        type: String,
        required: true,
        default: 'PENDING',
        enum: ['PENDING', 'APPROVED', 'COMPLETED']
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
    }
}, {
    timestamps:true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

const Project = model<ProjectDocument>('Projects', ProjectSchema)

export {Project}