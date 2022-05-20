"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectReport = void 0;
const mongoose_1 = require("mongoose");
const ReportSchema = new mongoose_1.Schema({
    project: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
    },
    file: {
        file_type: {
            type: String,
            required: true
        },
        file_content: {
            type: mongoose_1.Schema.Types.Mixed,
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
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
const ProjectReport = (0, mongoose_1.model)('Reports', ReportSchema);
exports.ProjectReport = ProjectReport;
//# sourceMappingURL=report.js.map