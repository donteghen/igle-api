import { PaymentDocument } from "./interfaces";
import { Schema, model } from "mongoose";

const PaymentSchema = new Schema<PaymentDocument>({
    sender:{
        type: Schema.Types.ObjectId,
        ref:'User',
        required: true
    },
    method:{
        type: String,
        required: true,
        enum:['MOBILE_MONEY', 'WIRED_TRANSFER','WESTERN_UNION', 'OTHERS']
    },
    amount: {
        type: Number,
        required: true,
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
    },
    note: {
        type:String,
        required: true
    },
    refunded: {
        type: Boolean,
        required: true,
        default: false
    }
}, {
    timestamps:true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

const Payment = model<PaymentDocument>('Payments', PaymentSchema)

export {Payment}