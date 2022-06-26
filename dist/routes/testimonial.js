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
exports.TestimonialRouter = void 0;
const express_1 = __importDefault(require("express"));
const authentication_1 = require("../middleware/authentication");
const errors_1 = require("../utils/errors");
const mailer_1 = require("../helpers/mailer");
const testimonial_1 = require("../models/testimonial");
const email_template_1 = require("../utils/constants/email-template");
const TestimonialRouter = express_1.default.Router();
exports.TestimonialRouter = TestimonialRouter;
function filterSetter(key, value) {
    switch (key) {
        case 'author':
            return { author: value };
        case 'min-rating':
            return { rating: { $gte: value } };
        case 'max-rating':
            return { rating: { $lte: value } };
        case 'show':
            return { show: value };
        default:
            return {};
    }
}
// Create a new request
TestimonialRouter.post('/api/testimonials', authentication_1.userAuth, authentication_1.userVerified, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const author = req.userId;
        const hasTestimonial = yield testimonial_1.Testimonial.findOne({ author });
        if (hasTestimonial) {
            let error = new Error();
            error = {
                name: 'ALLREADY_HAS_TESTIMONIAL',
                message: 'You already submitted a testimonial! For any changes please contact support'
            };
            throw error;
        }
        const newTestimonail = new testimonial_1.Testimonial({
            author,
            rating: Number.parseInt(req.body.rating, 10),
            comment: req.body.comment
        });
        const testimonial = yield newTestimonail.save();
        if (!testimonial) {
            let error = new Error();
            error = errors_1.SAVE_OPERATION_FAILED;
            throw error;
        }
        // Notify the admin of the new testimonial
        const { subject, heading, detail, linkText } = (0, email_template_1.notifyNewtestimonialAdded)();
        const link = `${process.env.CLIENT_URL}/dashboard`;
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
///////////////////////////////////////////////////////////////////////////////////
// Get all testimonials by admin
TestimonialRouter.get('/api/testimonials', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const testimonials = yield testimonial_1.Testimonial.find(filter).populate('author').exec();
        res.send({ ok: true, data: testimonials });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message });
    }
}));
// // Get single testimonial
TestimonialRouter.get('/api/testimonials/:id', authentication_1.userAuth, authentication_1.adminAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const testimonial = yield testimonial_1.Testimonial.findById(req.params.id).populate('author').exec();
        if (!testimonial) {
            let error = new Error();
            error = errors_1.NOT_FOUND;
            throw error;
        }
        res.send({ ok: true, data: testimonial });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message });
    }
}));
// Update testimonial show property
TestimonialRouter.patch('/api/testimonials/:id/show', authentication_1.userAuth, authentication_1.adminAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const testimonial = yield testimonial_1.Testimonial.findById(req.params.id).populate('author').exec();
        if (!testimonial) {
            let error = new Error();
            error = errors_1.NOT_FOUND;
            throw error;
        }
        testimonial.show = !testimonial.show;
        const updatedTestimonial = yield testimonial.save();
        res.status(200).send({ ok: true, data: updatedTestimonial });
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
// Delete a testimonial
TestimonialRouter.delete('/api/testimonials/:id', authentication_1.userAuth, authentication_1.adminAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deletedTesimonial = yield testimonial_1.Testimonial.findByIdAndDelete(req.params.id);
        if (!deletedTesimonial) {
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
//# sourceMappingURL=testimonial.js.map