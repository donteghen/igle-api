"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectRequest = void 0;
const mongoose_1 = require("mongoose");
const RequestSchema = new mongoose_1.Schema({
    sender: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    project: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
    request_type: {
        type: String,
        required: true,
        enum: ['360VR', 'PLAN UPGRADE', 'UPDATED REPORT', 'OTHERS']
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
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
const ProjectRequest = (0, mongoose_1.model)('Request', RequestSchema);
exports.ProjectRequest = ProjectRequest;
//# sourceMappingURL=request.js.map