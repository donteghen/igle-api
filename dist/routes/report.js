"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportRouter = void 0;
const express_1 = __importDefault(require("express"));
const authentication_1 = require("../middleware/authentication");
const errors_1 = require("../utils/errors");
const mailer_1 = require("../helpers/mailer");
const project_1 = require("../models/project");
const report_1 = require("../models/report");
const email_template_1 = require("../utils/constants/email-template");
const ReportRouter = express_1.default.Router();
exports.ReportRouter = ReportRouter;
function filterSetter(key, value) {
    switch (key) {
        case 'file_type':
            return { 'file.file_type': value };
        case 'project':
            return { project: value };
        case 'alert_dispatch':
            return { alert_dispatch: value };
        default:
            return {};
    }
}
// Get all a project's Reports by project owner(user)
ReportRouter.get('/api/user/profile/projects/:id/reports', authentication_1.userAuth, authentication_1.userVerified, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const activeProject = yield project_1.Project.findOne({ _id: req.params.id, owner: req.userId });
        if (!activeProject) {
            let error = new Error();
            error = errors_1.NOT_FOUND;
            throw error;
        }
        const projectReports = yield report_1.ProjectReport.find({ project: activeProject._id });
        res.send({ ok: true, data: projectReports });
    }
    catch (error) {
        res.status(400).send({ ok: false, error });
    }
}));
// Get a single project Report by project owner(user)
ReportRouter.get('/api/user/profile/projects/:projectId/reports/:reportId', authentication_1.userAuth, authentication_1.userVerified, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { projectId, reportId } = req.params;
        const activeProject = yield project_1.Project.findOne({ _id: projectId, owner: req.userId });
        if (!activeProject) {
            let error = new Error();
            error = errors_1.NOT_FOUND;
            throw error;
        }
        const projectReport = yield report_1.ProjectReport.findOne({ _id: reportId, project: activeProject._id });
        res.send({ ok: true, data: projectReport });
    }
    catch (error) {
        res.status(400).send({ ok: false, error });
    }
}));
//////////////////////////////////////////////////////////////////////////////////
// Create a new project report
ReportRouter.post('/api/projects/:id/reports', authentication_1.userAuth, authentication_1.adminAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { file_type, file_content, overview } = req.body;
        // making sure the project belongs to the user making the request
        const activeProject = yield project_1.Project.findById(req.params.id).populate('owner').exec();
        if (!activeProject) {
            throw new Error('Error');
        }
        if (!activeProject.active) {
            throw new Error('This project is inactive. Please contact the support team if you believe there is an issue with your payments!. Thanks and Sorry for the inconvinience');
        }
        const newReport = new report_1.ProjectReport({
            date: Date.now(),
            file: {
                file_type,
                file_content
            },
            project: req.params.id,
            overview
        });
        const projectReport = yield newReport.save();
        if (!projectReport) {
            let error = new Error();
            error = errors_1.SAVE_OPERATION_FAILED;
            throw error;
        }
        res.status(201).send({ ok: true, data: projectReport });
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            const VALIDATION_ERROR = {
                name: 'VALIDATION_ERROR',
                message: error.message
            };
            res.status(400).send({ ok: false, error: VALIDATION_ERROR });
            return;
        }
        res.status(400).send({ ok: false, error: error.message });
    }
}));
// Dispatch a notifcation about new report upload
ReportRouter.post('/api/reports/:id', authentication_1.userAuth, authentication_1.adminAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const report = yield report_1.ProjectReport.findById(req.params.id).populate({ path: 'project', populate: { path: 'owner' } });
        if (!report) {
            let error = new Error();
            error = errors_1.NOT_FOUND;
            throw error;
        }
        report.alert_dispatch = true;
        const updatedReport = yield report.save();
        // notify the project owner when a new report is uploaded
        const { owner, name, id } = report.project;
        const { subject, heading, detail, linkText } = (0, email_template_1.notifyReportDisptached)(owner.name, name, id);
        const link = process.env.CLIENT_URL + '/dashboard';
        const success = yield (0, mailer_1.mailer)(owner.email, subject, heading, detail, link, linkText);
        res.send({ ok: true });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message });
    }
}));
// Get all Report
ReportRouter.get('/api/reports', authentication_1.userAuth, authentication_1.adminAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let filter = {};
        const queries = Object.keys(req.query);
        if (queries.length > 0) {
            queries.forEach(key => {
                if (req.query[key]) {
                    filter = Object.assign(filter, filterSetter(key, req.query[key]));
                }
            });
        }
        const projectReports = yield report_1.ProjectReport.find(filter).populate({ path: 'project', populate: { path: 'owner' } }).exec();
        res.send({ ok: true, data: projectReports });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message });
    }
}));
// Get all a project's Reports
ReportRouter.get('/api/projects/:id/reports', authentication_1.userAuth, authentication_1.adminAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const projectReports = yield report_1.ProjectReport.find();
        res.send({ ok: true, data: projectReports });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message });
    }
}));
// Get a report preview
ReportRouter.get('/api/reports/:id', authentication_1.userAuth, authentication_1.adminAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const report = yield report_1.ProjectReport.findById(req.params.id).populate('project').exec();
        if (!report) {
            let error = new Error();
            error = errors_1.NOT_FOUND;
            throw error;
        }
        res.send({ ok: true, data: report });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message });
    }
}));
// Delete a report
ReportRouter.delete('/api/reports/:id', authentication_1.userAuth, authentication_1.adminAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deletedReport = yield report_1.ProjectReport.findByIdAndDelete(req.params.id);
        if (!deletedReport) {
            let error = new Error();
            error = errors_1.DELETE_OPERATION_FAILED;
            throw error;
        }
        res.send({ ok: true });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message });
    }
}));
//# sourceMappingURL=report.js.map