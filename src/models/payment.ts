import { PaymentDocument } from "./interfaces";
import { Schema, model } from "mongoose";

const PaymentSchema = new Schema<PaymentDocument>({
    sender:{
        type:String,
        required: true
    },
    method:{
        type: String,
        required: true,
        enum:['MOBIL MONEY', 'WIRED TRANSFER','WESTERN UNION', 'OTHERS']
    },

    project: {
        type: Schema.Types.ObjectId,
        ref:'Project',
        required: true,
    },
    date: {
        type: Number,
        required: true,
        default: Date.now()
    }
}, {
    timestamps:true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

const Payment = model<PaymentDocument>('Payments', PaymentSchema)

export {Payment}