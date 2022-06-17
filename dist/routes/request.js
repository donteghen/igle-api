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
exports.RequestRouter = void 0;
const express_1 = __importDefault(require("express"));
const authentication_1 = require("../middleware/authentication");
const errors_1 = require("../utils/errors");
const mailer_1 = require("../helpers/mailer");
const project_1 = require("../models/project");
const request_1 = require("../models/request");
const email_template_1 = require("../utils/constants/email-template");
const RequestRouter = express_1.default.Router();
exports.RequestRouter = RequestRouter;
function filterSetter(key, value) {
    switch (key) {
        case 'sender':
            return { sender: value };
        case 'status':
            return { status: value };
        case 'project':
            return { project: value };
        default:
            return {};
    }
}
// Create a new request
RequestRouter.post('/api/projects/:id/requests', authentication_1.userAuth, authentication_1.userVerified, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const sender = req.userId;
        // making sure the project belongs to the user making the request
        const activeProject = yield project_1.Project.findById(req.params.id).populate('owner').exec();
        if (!activeProject) {
            throw new Error('Error');
        }
        if (((_a = activeProject === null || activeProject === void 0 ? void 0 : activeProject.owner) === null || _a === void 0 ? void 0 : _a.id) !== sender.toString()) {
            throw new Error('Error');
        }
        if (!activeProject.active) {
            throw new Error('This project is inactive, please contact the support team');
        }
        const newRequest = new request_1.ProjectRequest({
            sender,
            project: req.params.id,
            request_type: req.body.request_type,
            detail: req.body.detail
        });
        const projectRequest = yield newRequest.save();
        if (!projectRequest) {
            let error = new Error();
            error = errors_1.SAVE_OPERATION_FAILED;
            throw error;
        }
        // Notify the admin of the new request
        const { owner, name, id } = activeProject;
        const { subject, heading, detail, linkText } = (0, email_template_1.notifyNewProjectRequest)(owner.name, name, id);
        const link = `${process.env.CLIENT_URL}`;
        const adminEmail = process.env.ADMIN_EMAIL;
        const _success = yield (0, mailer_1.mailer)(adminEmail, subject, heading, detail, link, linkText);
        res.status(201).send({ ok: true, data: projectRequest });
    }
    catch (error) {
        console.log(error);
        if (error.name === 'ValidationError') {
            const VALIDATION_ERROR = {
                name: 'VALIDATION_ERROR',
                message: error.message
            };
            res.status(400).send({ ok: false, error: VALIDATION_ERROR });
            return;
        }
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message });
    }
}));
// // Get all current user's requests
RequestRouter.get('/api/user/profile/requests', authentication_1.userAuth, authentication_1.userVerified, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        filter = Object.assign({ sender: req.userId }, filter);
        const requests = yield request_1.ProjectRequest.find(filter).populate('sender').populate('project').exec();
        res.send({ ok: true, data: requests });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message });
    }
}));
// // Get all current project's requests by the curent user
RequestRouter.get('/api/user/profile/projects/:projectId/requests', authentication_1.userAuth, authentication_1.userVerified, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { projectId } = req.params;
        const requests = yield request_1.ProjectRequest.find({ project: projectId, sender: req.userId }).populate('sender').populate('project').exec();
        res.send({ ok: true, data: requests });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message });
    }
}));
// // Get single request by the curent user for a project
RequestRouter.get('/api/user/profile/projects/:projectId/requests/:requestId', authentication_1.userAuth, authentication_1.userVerified, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { projectId, requestId } = req.params;
        const projectRequest = yield request_1.ProjectRequest.findOne({ id: requestId, project: projectId, sender: req.userId });
        if (!projectRequest) {
            let error = new Error();
            error = errors_1.NOT_FOUND;
            throw error;
        }
        res.send({ ok: true, data: projectRequest });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message });
    }
}));
///////////////////////////////////////////////////////////////////////////////////
// // Get all current project's requests
RequestRouter.get('/api/requests', authentication_1.userAuth, authentication_1.adminAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const projectRequests = yield request_1.ProjectRequest.find(filter).populate('sender').populate('project').exec();
        res.send({ ok: true, data: projectRequests });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message });
    }
}));
// // Get single request  for a project
RequestRouter.get('/api/requests/:id', authentication_1.userAuth, authentication_1.adminAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const projectRequest = yield request_1.ProjectRequest.findById(req.params.id).populate('sender').populate('project').exec();
        if (!projectRequest) {
            let error = new Error();
            error = errors_1.NOT_FOUND;
            throw error;
        }
        res.send({ ok: true, data: projectRequest });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message });
    }
}));
// Update request status
RequestRouter.patch('/api/requests/:id/update-status', authentication_1.userAuth, authentication_1.adminAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const projectRequest = yield request_1.ProjectRequest.findById(req.params.id).populate({ path: 'project', populate: { path: 'owner' } });
        if (!projectRequest) {
            let error = new Error();
            error = errors_1.NOT_FOUND;
            throw error;
        }
        projectRequest.status = req.body.status ? req.body.status : projectRequest.status;
        const updateRequest = yield projectRequest.save();
        // Notify the project owner about the request status update
        const { owner, name, id } = projectRequest.project;
        const { subject, heading, linkText, detail } = (0, email_template_1.notifyProjectRequestStatusChanged)(owner.name, name, id, updateRequest.status);
        const _link = `${process.env.CLIENT_URL}`;
        const _success = yield (0, mailer_1.mailer)(owner.email, subject, heading, detail, _link, linkText);
        res.status(200).send({ ok: true, data: updateRequest });
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
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message });
    }
}));
// Delete a projects request by Id
RequestRouter.delete('/api/requests/:id', authentication_1.userAuth, authentication_1.adminAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deletedRequest = yield request_1.ProjectRequest.findByIdAndDelete(req.params.id);
        if (!deletedRequest) {
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
//# sourceMappingURL=request.js.map