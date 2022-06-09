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
exports.User = void 0;
const mongoose_1 = require("mongoose");
const isEmail_1 = __importDefault(require("validator/lib/isEmail"));
const isStrongPassword_1 = __importDefault(require("validator/lib/isStrongPassword"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = require("jsonwebtoken");
const errors_1 = require("../utils/errors");
const UserSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        validate: {
            validator(value) {
                return (0, isEmail_1.default)(value);
            },
            message: 'Provided email is invalid!'
        }
    },
    password: {
        type: String,
        required: true,
        validate: {
            validator(value) {
                return (0, isStrongPassword_1.default)(value, {
                    minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1
                });
            },
            message() {
                return `password is not strong enough`;
            }
        }
    },
    tokens: {
        type: [String],
        required: true
    },
    avatarDeleteId: {
        type: String,
    },
    avatar: {
        type: String,
    },
    phone_number: {
        type: String,
    },
    bio: {
        type: String,
        default: 'No bio provided'
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false
    },
    isVerified: {
        type: Boolean,
        required: true,
        default: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
UserSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = this;
        if (user.isModified('password')) {
            user.password = yield bcrypt_1.default.hash(user.password, 8);
        }
        next();
    });
});
UserSchema.statics.getUserWithCredentials = function (email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield User.findOne({ email });
        if (!user) {
            let error = new Error();
            error = errors_1.NO_USER;
            throw error;
        }
        const isMatched = yield bcrypt_1.default.compare(password, user.password);
        if (!isMatched) {
            let error = new Error();
            error = errors_1.PASSWORD_INCORRECT;
            throw error;
        }
        return user;
    });
};
UserSchema.methods.generateUserSession = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const user = this;
        const token = (0, jsonwebtoken_1.sign)({ _id: user._id.toString() }, process.env.JWT_SECRET);
        if (!token) {
            let error = new Error();
            error = errors_1.NO_TOKEN;
            throw error;
        }
        user.tokens = user.tokens.concat(token);
        yield user.save();
        return token;
    });
};
UserSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();
    delete userObject.avatarDeleteId;
    delete userObject.password;
    delete userObject.tokens;
    return userObject;
};
const User = (0, mongoose_1.model)('User', UserSchema);
exports.User = User;
//# sourceMappingURL=user.js.map