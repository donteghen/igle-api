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
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuth = exports.userAuth = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const user_1 = require("../models/user");
const errors_1 = require("../utils/errors");
const getPayloadId = function (payload) {
    if (typeof payload !== 'string') {
        if ('_id' in payload) {
            return payload._id;
        }
    }
};
const userAuth = function (req, res, next) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const token = (_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
            // console.log(token)
            if (!token) {
                let error = new Error();
                error = errors_1.AUTH_FAILED;
                throw error;
            }
            const decode = (0, jsonwebtoken_1.verify)(token, process.env.JWT_SECRET);
            const _id = getPayloadId(decode);
            const user = yield user_1.User.findOne({ _id, tokens: token });
            if (!user) {
                let error = new Error();
                error = errors_1.AUTH_FAILED;
                throw error;
            }
            req.userId = user._id;
            req.token = token;
            next();
        }
        catch (error) {
            res.status(401).send({ ok: false, error });
        }
    });
};
exports.userAuth = userAuth;
const adminAuth = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield user_1.User.findOne({ _id: req.userId, tokens: req.token });
            if (!user) {
                let error = new Error();
                error = errors_1.AUTH_FAILED;
                throw error;
            }
            if (!user.isAdmin) {
                throw new Error('Admin access restricted!');
            }
            next();
        }
        catch (error) {
            res.status(401).send({ ok: false, error: error.message });
        }
    });
};
exports.adminAuth = adminAuth;
//# sourceMappingURL=authentication.js.map