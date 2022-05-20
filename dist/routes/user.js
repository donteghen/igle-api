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
exports.UserRouter = void 0;
const express_1 = __importDefault(require("express"));
const uuid_1 = require("uuid");
const user_1 = require("../models/user");
const authentication_1 = require("../middleware/authentication");
const errors_1 = require("../utils/errors");
const successes_1 = require("../utils/successes");
const multer_1 = require("../helpers/multer");
const cloudinary_1 = require("../helpers/cloudinary");
const token_1 = require("../models/token");
const mailer_1 = require("../helpers/mailer");
const bcrypt_1 = require("bcrypt");
const isStrongPassword_1 = __importDefault(require("validator/lib/isStrongPassword"));
const UserRouter = express_1.default.Router();
exports.UserRouter = UserRouter;
// get User profile
UserRouter.get('/api/user/profile', authentication_1.userAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_1.User.findById(req.userId);
        res.send({ ok: true, data: user });
    }
    catch (error) {
        console.log(error);
        res.send({ ok: false, error });
    }
}));
// user registration router endpoint
UserRouter.post('/api/users/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newUser = new user_1.User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            phone_number: req.body.phone_number
        });
        const user = yield newUser.save();
        if (!user) {
            let error = new Error();
            error = errors_1.SAVE_OPERATION_FAILED;
            throw error;
        }
        const generatedToken = yield newUser.generateUserSession();
        // console.log(generatedToken)
        if (!generatedToken) {
            let error = new Error();
            error = errors_1.TOKEN_GENERATION_FAILED;
            throw error;
        }
        res.status(201).send({ ok: true, data: { user, generatedToken } });
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
// User avatar upload
UserRouter.post('/api/user/profile/avatar', authentication_1.userAuth, multer_1.multerUpload.single('avatar'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_1.User.findById(req.userId);
        if (user.avatar) {
            yield cloudinary_1.cloudinary.v2.uploader.destroy(user.avatarDeleteId);
        }
        const result = yield cloudinary_1.cloudinary.v2.uploader.upload(req.file.path, { folder: "Igle/Users/Avatars/",
            public_id: user._id
        });
        user.avatar = result.secure_url;
        user.avatarDeleteId = result.public_id;
        const updatedUser = yield user.save();
        res.send({ ok: true, data: updatedUser });
    }
    catch (error) {
        res.status(400).send({ ok: false, error });
    }
}));
// User update endpoint
UserRouter.patch('/api/user/profile/update', authentication_1.userAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_1.User.findById(req.userId);
        if (!user) {
            let error = new Error();
            error = errors_1.NO_USER;
            throw error;
        }
        const { name, email, bio, phone_number } = req.body;
        user.name = name ? name : user.name;
        user.email = email ? email : user.email;
        user.bio = bio ? bio : user.bio;
        user.phone_number = phone_number ? phone_number : user.phone_number;
        const updatedUser = yield user.save();
        if (!updatedUser) {
            let error = new Error();
            error = errors_1.SAVE_OPERATION_FAILED;
            throw error;
        }
        res.send({ ok: true, data: updatedUser });
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
// Change user password
UserRouter.post('/api/user/profile/change-password', authentication_1.userAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_1.User.findById(req.userId);
        if (!user) {
            let error = new Error();
            error = errors_1.NO_USER;
            throw error;
        }
        const { newPassword, oldPassword } = req.body;
        const isMatched = yield (0, bcrypt_1.compare)(oldPassword, user.password);
        if (!isMatched) {
            let error = new Error();
            error = errors_1.OLD_PASSWORD_IS_INCORRECT;
            throw error;
        }
        if (!(0, isStrongPassword_1.default)(newPassword, { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })) {
            let error = new Error();
            error = errors_1.NEW_PASSWORD_IS_INVALID;
            throw error;
        }
        user.password = newPassword;
        yield user.save();
        res.send({ ok: true });
    }
    catch (error) {
        console.log(error);
        res.status(400).send({ ok: false, error });
    }
}));
// reset password endpoint
UserRouter.post('/api/users/reset-password', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_1.User.findOne({ email: req.body.email });
        if (!user) {
            let error = new Error();
            error = errors_1.SAVE_OPERATION_FAILED;
            throw error;
        }
        const generatedToken = new token_1.Token({
            owner: user.id,
            secret: (0, uuid_1.v4)(),
            createdAt: Date.now()
        });
        const newToken = yield generatedToken.save();
        const link = `${process.env.CLIENT_URL}/confirm-user-password?user=${user.email}&token=${newToken.secret}&createdAt=${newToken.createdAt}`;
        const success = (0, mailer_1.mailer)(user.email, 'User Password Reset', 'You have requested to reset your password', 'A unique link to reset your password has been generated for you. To reset your password, click the following link and follow the instructions. <strong>This operation has an active life cycle 1 hour!</strong>', link, 'click to continue');
        res.send({ ok: true });
    }
    catch (error) {
        console.log(error);
        res.status(400).send({ ok: false, error });
    }
}));
UserRouter.post('/api/users/confirm-reset-password/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, token } = req.body;
        if (!(0, uuid_1.validate)(token)) {
            let error = new Error();
            error = errors_1.WRONG_RESET_TOKEN_TYPE;
            throw error;
        }
        const user = yield user_1.User.findOne({ email });
        if (!user) {
            let error = new Error();
            error = errors_1.NO_USER;
            throw error;
        }
        const resetToken = yield token_1.Token.findOne({ owner: user._id, secret: token });
        if (!resetToken) {
            let error = new Error();
            error = errors_1.INVALID_RESET_TOKEN;
            throw error;
        }
        yield token_1.Token.deleteMany({ owner: user.id });
        if (Date.now() - resetToken.createdAt > 3600000) {
            let error = new Error();
            error = errors_1.RESET_TOKEN_DEACTIVED;
            throw error;
        }
        user.password = password;
        yield user.save();
        res.send({ ok: true, data: successes_1.PASSWORD_RESET_SUCCESSFUL });
    }
    catch (error) {
        console.log(error);
        res.status(400).send({ ok: false, error });
    }
}));
// update project plan by user
// UserRouter.patch('/api/projects/:id/user-update-project-plan', userAuth, async (req:Request, res:Response) => {
//     try {
//         const project = await Project.findOne({id: req.params.id, owner: req.userId})
//         if (!project) {
//             let error:IError = new Error()
//             error = NOT_FOUND
//             throw error
//         }
//         project.plan = req.body.plan
//         await project.save()
//         res.send({ok:true})
//     } catch (error) {
//         console.log(error)
//         res.status(400).send({ok:false, error})
//     }
// })
// User login endpoint
UserRouter.post('/api/users/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_1.User.getUserWithCredentials(req.body.email, req.body.password);
        const newSessionToken = yield user.generateUserSession();
        res.send({ ok: true, data: { token: newSessionToken, user } });
    }
    catch (error) {
        // console.log(error)
        res.status(400).send({ ok: false, error });
    }
}));
// User Logout endpoint
UserRouter.post('/api/users/logout', authentication_1.userAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_1.User.findById(req.userId);
        user.tokens = [];
        yield user.save();
        res.send({ ok: true });
    }
    catch (error) {
        res.status(400).send({ ok: false, error });
    }
}));
/********************************* Admin Restricted ******************************************** */
// get all users is admin restricted router endpoint
UserRouter.get('/api/users', authentication_1.userAuth, authentication_1.adminAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield user_1.User.find();
        res.send({ ok: true, data: users });
    }
    catch (error) {
        res.send({ ok: false, error });
    }
}));
// get a single user by id admin
UserRouter.get('/api/users/:id', authentication_1.userAuth, authentication_1.adminAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_1.User.findById(req.params.id);
        if (!user) {
            let error = new Error();
            error = errors_1.NO_USER;
            throw error;
        }
        res.send({ ok: true, data: user });
    }
    catch (error) {
        res.status(400).send({ ok: false, error });
    }
}));
// User deletion by admin
UserRouter.delete('/api/users/:id', authentication_1.userAuth, authentication_1.adminAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deletedUser = yield user_1.User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            let error = new Error();
            error = errors_1.DELETE_OPERATION_FAILED;
            throw error;
        }
        if (deletedUser.avatar && deletedUser.avatarDeleteId) {
            yield cloudinary_1.cloudinary.v2.uploader.destroy(deletedUser.avatarDeleteId);
        }
        res.send({ ok: true, data: successes_1.DELETED_SUCCESSFULLY });
    }
    catch (error) {
        res.status(400).send({ ok: false, error });
    }
}));
//# sourceMappingURL=user.js.map