import { Schema, model } from "mongoose";
import { TestimonialDocument } from "./interfaces";

const TestimonialSchema = new Schema<TestimonialDocument>({
    author: {
        type: Schema.Types.ObjectId,
        ref:'User',
        required: true,
    },
    rating: {
        type: Number,
        required: true,
    },
    comment: {
        type: String,
        required: true,
    },
    show: {
        type: Boolean,
        required: true,
        default: false
    }
}, {
    timestamps:true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

const Testimonial = model<TestimonialDocument>('Testimonial', TestimonialSchema)

export {Testimonial}