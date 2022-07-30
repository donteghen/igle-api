"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Token = void 0;
const mongoose_1 = require("mongoose");
const TokenSchema = new mongoose_1.Schema({
    owner: {
        type: String,
        required: true
    },
    secret: {
        type: String,
        required: true
    },
    createdAt: {
        type: Number,
        default: Date.now(),
    }
});
TokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 });
const Token = (0, mongoose_1.model)('Token', TokenSchema);
exports.Token = Token;
//# sourceMappingURL=token.js.map