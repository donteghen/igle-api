"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contact = void 0;
const mongoose_1 = require("mongoose");
const isEmail_1 = __importDefault(require("validator/lib/isEmail"));
const ContactSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        validate: {
            validator(value) {
                return (0, isEmail_1.default)(value);
            },
            message() {
                return `email validation failed!`;
            }
        }
    },
    subject: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    replied: {
        type: Boolean,
        required: true,
        default: false
    },
    phone_number: {
        type: String,
        required: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
const Contact = (0, mongoose_1.model)('Contacts', ContactSchema);
exports.Contact = Contact;
//# sourceMappingURL=contact.js.map