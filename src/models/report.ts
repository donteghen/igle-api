import { Schema, model } from "mongoose";
import { ReportDocument } from "./interfaces";

const ReportSchema = new Schema<ReportDocument>({
    project: {
        type: Schema.Types.ObjectId,
        required: true,
    },

    file:{
        file_type: {
            type: String,
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
    }
}, {
    timestamps:true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

const Report = model<ReportDocument>('Reports', ReportSchema)

export {Report}