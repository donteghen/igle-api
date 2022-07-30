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
exports.ProjectRouter = void 0;
const express_1 = __importDefault(require("express"));
const authentication_1 = require("../middleware/authentication");
const errors_1 = require("../utils/errors");
const successes_1 = require("../utils/successes");
const mailer_1 = require("../helpers/mailer");
const project_1 = require("../models/project");
const report_1 = require("../models/report");
const user_1 = require("../models/user");
const request_1 = require("../models/request");
const email_template_1 = require("../utils/constants/email-template");
const ProjectRouter = express_1.default.Router();
exports.ProjectRouter = ProjectRouter;
function filterSetter(key, value) {
    switch (key) {
        case 'owner':
            return { 'owner': value };
        case 'plan':
            return { 'plan': value };
        case 'name':
            return { name: { "$regex": value, $options: 'i' } };
        case 'status':
            return { status: value };
        case 'active':
            return { active: value };
        default:
            return {};
    }
}
// create new project
ProjectRouter.post('/api/projects', authentication_1.userAuth, authentication_1.userVerified, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, plan, detail, description, location } = req.body;
        const owner = req.userId;
        const newProject = new project_1.Project({
            name,
            owner,
            plan,
            detail,
            description,
            location
        });
        const project = yield newProject.save();
        if (!project) {
            let error = new Error();
            error = errors_1.SAVE_OPERATION_FAILED;
            throw error;
        }
        // Send a notifucation email to the admin
        const link = `${process.env.CLIENT_URL}`;
        const adminEmail = process.env.ADMIN_EMAIL;
        const _success = yield (0, mailer_1.mailer)(adminEmail, email_template_1.notifyProjectCreated.subject, email_template_1.notifyProjectCreated.heading, email_template_1.notifyProjectCreated.detail, link, email_template_1.notifyProjectCreated.linkText);
        res.status(201).send({ ok: true, data: project });
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            const VALIDATION_ERROR = {
                name: 'VALIDATION_ERROR',
                message: error.message
            };
            res.status(400).send({ ok: false, error: VALIDATION_ERROR.message });
            return;
        }
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message });
    }
}));
// Get all projects created by the curent user
ProjectRouter.get('/api/user/profile/projects', authentication_1.userAuth, authentication_1.userVerified, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        filter = Object.assign({ owner: req.userId }, filter);
        const projects = yield project_1.Project.find(filter).populate('owner').exec();
        res.send({ ok: true, data: projects });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message });
    }
}));
// Get a single project created by the curent user
ProjectRouter.get('/api/user/profile/projects/:id', authentication_1.userAuth, authentication_1.userVerified, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.params);
        const project = yield project_1.Project.findOne({ _id: req.params.id, owner: req.userId }).populate('owner').exec();
        if (!project) {
            let error = new Error();
            error = errors_1.NOT_FOUND;
            throw error;
        }
        res.send({ ok: true, data: project });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message });
    }
}));
// delete project by user
ProjectRouter.delete('/api/projects/:id', authentication_1.userAuth, authentication_1.userVerified, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deletedProject = yield project_1.Project.findOneAndDelete({ id: req.params.id, owner: req.userId });
        if (!deletedProject) {
            let error = new Error();
            error = errors_1.DELETE_OPERATION_FAILED;
            throw error;
        }
        const user = yield user_1.User.findById(req.userId);
        // delete project's reports
        yield report_1.ProjectReport.deleteMany({ project: deletedProject.id });
        // delete project's  requests
        yield request_1.ProjectRequest.deleteMany({ project: deletedProject.id });
        // Notify admin via email of the deletion operation so that cloud resources can be freed
        const { subject, heading, linkText, detail } = (0, email_template_1.notifyProjectDeleted)(user === null || user === void 0 ? void 0 : user.email, deletedProject.name, deletedProject.id);
        const _link = `${process.env.CLIENT_URL}`;
        const adminEmail = process.env.ADMIN_EMAIL;
        const _success = yield (0, mailer_1.mailer)(adminEmail, subject, heading, detail, _link, linkText);
        res.send({ ok: true, data: successes_1.DELETED_SUCCESSFULLY });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message });
    }
}));
// Update project user
ProjectRouter.patch('/api/user/profile/projects/:id/update', authentication_1.userAuth, authentication_1.userVerified, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const project = yield project_1.Project.findOne({ _id: req.params.id, owner: req.userId });
        if (!project) {
            let error = new Error();
            error = errors_1.NOT_FOUND;
            throw error;
        }
        const { name, detail, description } = req.body;
        project.name = name ? name : project.name;
        project.detail = detail ? detail : project.detail;
        project.description = description ? description : project.description;
        const updatedProject = yield project.save();
        res.send({ ok: true, data: updatedProject });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message });
    }
}));
// upgrade plan for a project by user
ProjectRouter.patch('/api/user/profile/projects/:id/upgrade-plan', authentication_1.userAuth, authentication_1.userVerified, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const project = yield project_1.Project.findById(req.params.id);
        if (!project) {
            let error = new Error();
            error = errors_1.NOT_FOUND;
            throw error;
        }
        project.plan = req.body.plan ? req.body.plan : project.plan;
        const updatedProject = yield project.save();
        res.send({ ok: true, data: updatedProject });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message });
    }
}));
//////////////////////////////////////////////////////////////////////////////////////
// Get all projects by Admin
ProjectRouter.get('/api/projects', authentication_1.userAuth, authentication_1.adminAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const projects = yield project_1.Project.find(filter).populate('owner').exec();
        res.send({ ok: true, data: projects });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message });
    }
}));
// Get a single projects by Admin
ProjectRouter.get('/api/projects/:id', authentication_1.userAuth, authentication_1.adminAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const project = yield project_1.Project.findById(req.params.id).populate('owner').exec();
        if (!project) {
            let error = new Error();
            error = errors_1.NOT_FOUND;
            throw error;
        }
        res.send({ ok: true, data: project });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message });
    }
}));
// upgrade plan for a project by Admin
ProjectRouter.patch('/api/projects/:id/upgrade-plan', authentication_1.userAuth, authentication_1.adminAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const project = yield project_1.Project.findById(req.params.id);
        if (!project) {
            let error = new Error();
            error = errors_1.NOT_FOUND;
            throw error;
        }
        const user = yield user_1.User.findById(project.owner);
        project.plan = req.body.plan ? req.body.plan : project.plan;
        const updatedProject = yield project.save();
        // Notify project on project plan updated
        const { subject, heading, linkText, detail } = (0, email_template_1.notifyProjectPlanUpgraded)(user === null || user === void 0 ? void 0 : user.name, updatedProject.name, updatedProject.id, updatedProject.plan);
        const _link = `${process.env.CLIENT_URL}`;
        const _success = yield (0, mailer_1.mailer)(user.email, subject, heading, detail, _link, linkText);
        res.send({ ok: true, data: updatedProject });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message });
    }
}));
// change status for a project by Admin
ProjectRouter.patch('/api/projects/:id/status-change', authentication_1.userAuth, authentication_1.adminAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const project = yield project_1.Project.findById(req.params.id);
        if (!project) {
            let error = new Error();
            error = errors_1.NOT_FOUND;
            throw error;
        }
        project.status = req.body.status ? req.body.status : project.status;
        const updatedProject = yield project.save();
        const user = yield user_1.User.findById(project.owner);
        // Notify project on project status change
        const { subject, heading, linkText, detail } = (0, email_template_1.notifyProjectStatusChange)(user === null || user === void 0 ? void 0 : user.name, updatedProject.name, updatedProject.id, updatedProject.status);
        const _link = `${process.env.CLIENT_URL}`;
        const _success = yield (0, mailer_1.mailer)(user.email, subject, heading, detail, _link, linkText);
        res.send({ ok: true, data: updatedProject });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message });
    }
}));
// activate project after receieving payments project by Admin
ProjectRouter.patch('/api/projects/:id/activate', authentication_1.userAuth, authentication_1.adminAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const project = yield project_1.Project.findById(req.params.id);
        if (!project) {
            let error = new Error();
            error = errors_1.NOT_FOUND;
            throw error;
        }
        project.active = true;
        const updatedProject = yield project.save();
        // Notify project owner when project is activated
        const user = yield user_1.User.findById(project.owner);
        const { subject, heading, linkText, detail } = (0, email_template_1.notifyProjectActivated)(user === null || user === void 0 ? void 0 : user.name, updatedProject.name, updatedProject.id);
        const _link = `${process.env.CLIENT_URL}/login`;
        const _success = yield (0, mailer_1.mailer)(user.email, subject, heading, detail, _link, linkText);
        res.send({ ok: true, data: updatedProject });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message });
    }
}));
// de-activate project if payment is not made project by Admin
ProjectRouter.patch('/api/projects/:id/deactivate', authentication_1.userAuth, authentication_1.adminAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const project = yield project_1.Project.findById(req.params.id);
        if (!project) {
            let error = new Error();
            error = errors_1.NOT_FOUND;
            throw error;
        }
        project.active = false;
        const updatedProject = yield project.save();
        // Notify project owner when project is deactivated
        const user = yield user_1.User.findById(project.owner);
        const { subject, heading, linkText, detail } = (0, email_template_1.notifyProjectDeactivated)(user === null || user === void 0 ? void 0 : user.name, updatedProject.name, updatedProject.id);
        const _link = `${process.env.CLIENT_URL}/contact`;
        const _success = yield (0, mailer_1.mailer)(user.email, subject, heading, detail, _link, linkText);
        res.send({ ok: true, data: updatedProject });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message });
    }
}));
//# sourceMappingURL=project.js.map