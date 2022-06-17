"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = void 0;
const mongoose_1 = require("mongoose");
const PaymentSchema = new mongoose_1.Schema({
    sender: {
        type: String,
        required: true
    },
    method: {
        type: String,
        required: true,
        enum: ['MOBIL MONEY', 'WIRED TRANSFER', 'WESTERN UNION', 'OTHERS']
    },
    project: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
    date: {
        type: Number,
        required: true,
        default: Date.now()
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
const Payment = (0, mongoose_1.model)('Payments', PaymentSchema);
exports.Payment = Payment;
//# sourceMappingURL=payment.js.map