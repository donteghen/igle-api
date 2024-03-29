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
exports.ContactRouter = void 0;
const express_1 = __importDefault(require("express"));
const authentication_1 = require("../middleware/authentication");
const errors_1 = require("../utils/errors");
const mailer_1 = require("../helpers/mailer");
const contact_1 = require("../models/contact");
const email_template_1 = require("../utils/constants/email-template");
const ContactRouter = express_1.default.Router();
exports.ContactRouter = ContactRouter;
function filterSetter(key, value) {
    switch (key) {
        case 'replied':
            return { replied: value };
        case 'email':
            return { email: value };
        case 'name':
            return { name: value };
        default:
            return {};
    }
}
// Create a new contact message
ContactRouter.post('/api/contacts', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, subject, message, phone_number } = req.body;
        const newContact = new contact_1.Contact({
            name,
            email,
            subject,
            message,
            phone_number
        });
        const contact = yield newContact.save();
        if (!contact) {
            let error = new Error();
            error = errors_1.SAVE_OPERATION_FAILED;
            throw error;
        }
        // Notify admin of new contact message
        const link = `${process.env.CLIENT_URL}`;
        const adminEmail = process.env.ADMIN_EMAIL;
        const _success = yield (0, mailer_1.mailer)(adminEmail, email_template_1.notifyNewContactMessage.subject, email_template_1.notifyNewContactMessage.heading, email_template_1.notifyNewContactMessage.detail, link, email_template_1.notifyNewContactMessage.linkText);
        res.status(201).send({ ok: true });
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
////////////////////////////////////////////////////////////////////////////////////
// Get all contact messages by admin
ContactRouter.get('/api/contacts', authentication_1.userAuth, authentication_1.adminAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const contacts = yield contact_1.Contact.find(filter);
        res.send({ ok: true, data: contacts });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message });
    }
}));
// Get a single contact message by admin
ContactRouter.get('/api/contacts/:id', authentication_1.userAuth, authentication_1.adminAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contact = yield contact_1.Contact.findById(req.params.id);
        if (!contact) {
            let error = new Error();
            error = errors_1.NOT_FOUND;
            throw error;
        }
        res.send({ ok: true, data: contact });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message });
    }
}));
// Make a contact message as seen
ContactRouter.patch('/api/contacts/:id/replied', authentication_1.userAuth, authentication_1.adminAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contact = yield contact_1.Contact.findById(req.params.id);
        if (!contact) {
            let error = new Error();
            error = errors_1.NOT_FOUND;
            throw error;
        }
        contact.replied = true;
        const updateContact = yield contact.save();
        res.send({ ok: true, data: updateContact });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message });
    }
}));
// Delete Contact Message
ContactRouter.delete('/api/contacts/:id', authentication_1.userAuth, authentication_1.adminAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deletedContact = yield contact_1.Contact.findByIdAndDelete(req.params.id);
        if (!deletedContact) {
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
// Delete Contact Message
ContactRouter.delete('/api/delete-contacts', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const count = yield contact_1.Contact.deleteMany();
        console.log(count);
        res.send({ ok: true });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message });
    }
}));
//# sourceMappingURL=contact.js.map