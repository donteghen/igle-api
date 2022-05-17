"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Project = void 0;
const mongoose_1 = require("mongoose");
const ProjectSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
    },
    status: {
        type: String,
        required: true,
        default: 'PENDING',
        enum: ['PENDING', 'APPROVED', 'COMPLETED']
    },
    plan: {
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
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
const Project = (0, mongoose_1.model)('Projects', ProjectSchema);
exports.Project = Project;
//# sourceMappingURL=project.js.map