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
const project_1 = require("../models/project");
const report_1 = require("../models/report");
const request_1 = require("../models/request");
const ProjectRouter = express_1.default.Router();
exports.ProjectRouter = ProjectRouter;
// create new project
ProjectRouter.post('/api/projects', authentication_1.userAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, plan, detail, description } = req.body;
        const owner = req.userId;
        const newProject = new project_1.Project({
            name,
            owner,
            plan,
            detail,
            description
        });
        const project = yield newProject.save();
        if (!project) {
            let error = new Error();
            error = errors_1.SAVE_OPERATION_FAILED;
            throw error;
        }
        res.status(201).send({ ok: true, data: project });
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
        res.status(400).send({ ok: false, error });
    }
}));
// delete project by user
ProjectRouter.delete('/api/projects/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deletedProject = yield project_1.Project.findByIdAndDelete(req.params.id);
        if (!deletedProject) {
            let error = new Error();
            error = errors_1.DELETE_OPERATION_FAILED;
            throw error;
        }
        // delete project's reports
        yield report_1.ProjectReport.deleteMany({ project: deletedProject.id });
        // delete project's  requests
        yield request_1.ProjectRequest.deleteMany({ project: deletedProject.id });
        res.send({ ok: true, data: successes_1.DELETED_SUCCESSFULLY });
    }
    catch (error) {
        res.status(400).send({ ok: false, error });
    }
}));
//////////////////////////////////////////////////////////////////////////////////////
// Get all projects by Admin
ProjectRouter.get('/api/projects', authentication_1.userAuth, authentication_1.adminAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const projects = yield project_1.Project.find();
        res.send({ ok: true, data: projects });
    }
    catch (error) {
        res.status(400).send({ ok: false, error });
    }
}));
//# sourceMappingURL=project.js.map