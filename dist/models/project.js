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
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        required: true,
        default: 'PENDING',
        enum: ['PENDING', 'APPROVED', 'COMPLETED', 'CANCELED']
    },
    plan: {
        type: String,
        required: true,
        enum: ['360VRWT', 'PHOTO', 'VIDEO', 'WEBCAM']
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
    },
    location: {
        region: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        address_line: {
            type: String,
            required: true
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
const Project = (0, mongoose_1.model)('Project', ProjectSchema);
exports.Project = Project;
//# sourceMappingURL=project.js.map