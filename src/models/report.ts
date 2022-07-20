import { Schema, model } from "mongoose";
import { ReportDocument } from "./interfaces";

const ReportSchema = new Schema<ReportDocument>({
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },

    file:{
        file_type: {
            type: String,
            enum:['PHOTO', 'VIDEO', '360VRWT', 'WEBCAM'],
            required: true
        },
        file_content: {
            type: Schema.Types.Mixed,
            required: true
        }
    },
    overview: {
        type: String,
        required: true,
    },
    alert_dispatch: {
        type: Boolean,
        required: true,
        default: false
    },
    date: {
        type: Number,
        required:true,
    }
}, {
    timestamps:true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

const ProjectReport = model<ReportDocument>('Report', ReportSchema)

export {ProjectReport}