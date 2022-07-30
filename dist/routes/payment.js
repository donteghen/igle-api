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
exports.PaymentRouter = void 0;
const payment_1 = require("../models/payment");
const express_1 = __importDefault(require("express"));
const authentication_1 = require("../middleware/authentication");
const errors_1 = require("../utils/errors");
const mailer_1 = require("../helpers/mailer");
const email_template_1 = require("../utils/constants/email-template");
const project_1 = require("../models/project");
const user_1 = require("../models/user");
const PaymentRouter = express_1.default.Router();
exports.PaymentRouter = PaymentRouter;
// casting a string to boolean
function toBoolean(stringValue) {
    if (stringValue === 'true') {
        return true;
    }
    else if (stringValue === 'false') {
        return false;
    }
    else {
        return undefined;
    }
}
// query filter function
function filterSetter(key, value) {
    let formattedValue;
    switch (key) {
        case 'sender':
            formattedValue = String(value);
            return { sender: formattedValue };
        case 'project':
            formattedValue = String(value);
            return { project: formattedValue };
        case 'method':
            formattedValue = String(value);
            return { method: formattedValue };
        case 'refunded':
            formattedValue = toBoolean(value);
            return { refunded: formattedValue };
        default:
            return {};
    }
}
/////////////////////////////// User Restricted //////////////////////////////////////////
// get all user's payment history
PaymentRouter.get('/api/user/profile/payments', authentication_1.userAuth, authentication_1.userVerified, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payments = yield payment_1.Payment.find({ sender: req.userId }).populate('project').populate('sender').exec();
        res.send({ ok: true, data: payments });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message });
    }
}));
// get user's project payments
PaymentRouter.get('/api/user/profile/projects/:id/payments', authentication_1.userAuth, authentication_1.userVerified, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const project = yield project_1.Project.findOne({ _id: req.params.id, owner: req.userId });
        if (!project) {
            let error = new Error();
            error = errors_1.NOT_FOUND;
            throw error;
        }
        const payments = yield payment_1.Payment.find({ project: project.id }).populate('project').populate('sender').exec();
        res.send({ ok: true, data: payments });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message });
    }
}));
// // Get single payment by user
PaymentRouter.get('/api/user/profile/payments/:id', authentication_1.userAuth, authentication_1.userVerified, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payment = yield payment_1.Payment.findOne({ _id: req.params.id, sender: req.userId }).populate('project').populate('sender').exec();
        if (!payment) {
            let error = new Error();
            error = errors_1.NOT_FOUND;
            throw error;
        }
        res.send({ ok: true, data: payment });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message });
    }
}));
/////////////////////////////// Admin Restricted //////////////////////////////////////////
// post new payment by admin
PaymentRouter.post('/api/payments', authentication_1.userAuth, authentication_1.adminAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { method, project, note, amount } = req.body;
        // get the related project
        const linkedProject = yield project_1.Project.findById(project).populate('owner').exec();
        if (!linkedProject) {
            let error;
            error = errors_1.NOT_FOUND;
            throw error;
        }
        // get the project owner
        const linkedSender = linkedProject === null || linkedProject === void 0 ? void 0 : linkedProject.owner;
        if (!linkedSender) {
            let error;
            error = errors_1.NOT_FOUND;
            throw error;
        }
        const newPayment = new payment_1.Payment({
            sender: linkedSender.id,
            method,
            project,
            note,
            amount
        });
        console.log(newPayment);
        const payment = yield newPayment.save();
        if (!payment) {
            let error = new Error();
            error = errors_1.SAVE_OPERATION_FAILED;
            throw error;
        }
        // Confirm payment recieved to user
        const { subject, heading, detail, linkText } = (0, email_template_1.confirmPaymentReceived)(linkedSender.name, linkedProject.name, linkedProject.plan);
        const link = `${process.env.CLIENT_URL}/profile`;
        const adminEmail = process.env.ADMIN_EMAIL;
        const _success = yield (0, mailer_1.mailer)(adminEmail, subject, heading, detail, link, linkText);
        res.status(201).send({ ok: true });
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
// Get all payments by admin
PaymentRouter.get('/api/payments', authentication_1.userAuth, authentication_1.adminAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const payments = yield payment_1.Payment.find(filter).populate('project').populate('sender').exec();
        res.send({ ok: true, data: payments });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message });
    }
}));
// // Get single payment by admin
PaymentRouter.get('/api/payments/:id', authentication_1.userAuth, authentication_1.adminAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payment = yield payment_1.Payment.findById(req.params.id).populate('project').populate('sender').exec();
        if (!payment) {
            let error = new Error();
            error = errors_1.NOT_FOUND;
            throw error;
        }
        res.send({ ok: true, data: payment });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message });
    }
}));
// Update payment refund status by user
PaymentRouter.patch('/api/payments/:id/refunded', authentication_1.userAuth, authentication_1.adminAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payment = yield payment_1.Payment.findById(req.params.id);
        if (!payment) {
            let error;
            error = errors_1.NOT_FOUND;
            throw error;
        }
        const linkedSender = yield user_1.User.findById(payment.sender);
        if (!linkedSender) {
            let error;
            error = errors_1.NOT_FOUND;
            throw error;
        }
        const linkedProject = yield project_1.Project.findById(payment.project);
        if (!linkedProject) {
            let error;
            error = errors_1.NOT_FOUND;
            throw error;
        }
        payment.refunded = true;
        const updatedPayment = yield payment.save();
        // Confirm payment refunded to user
        const { subject, heading, detail, linkText } = (0, email_template_1.confirmPaymentRefund)(linkedSender.name, linkedProject.name, linkedProject.plan);
        const link = `${process.env.CLIENT_URL}/profile`;
        const adminEmail = process.env.ADMIN_EMAIL;
        const _success = yield (0, mailer_1.mailer)(adminEmail, subject, heading, detail, link, linkText);
        res.status(200).send({ ok: true });
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
// Delete a payment
PaymentRouter.delete('/api/payments/:id/', authentication_1.userAuth, authentication_1.adminAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deletedPayment = yield payment_1.Payment.findByIdAndDelete(req.params.id);
        if (!deletedPayment) {
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
//# sourceMappingURL=payment.js.map