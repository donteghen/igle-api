"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailer = void 0;
const mail_1 = __importDefault(require("@sendgrid/mail"));
const mailer_html_1 = require("../utils/mailer-html");
const mailer = (toEmail, subject, heading, detail, link, linkText) => {
    let mailresponse;
    mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
        to: `${toEmail}`,
        from: 'donaldteghen@gmail.com',
        subject: `${subject}`,
        text: `${heading} /n ${detail}`,
        html: (0, mailer_html_1.mailerHtml)(heading, detail, link, linkText),
    };
    mail_1.default.send(msg).then(() => {
        mailresponse = {
            ok: true,
            error: '',
            message: 'Successfuly send!'
        };
    })
        .catch((error) => {
        mailresponse = {
            ok: true,
            error: error.response.body,
            message: ''
        };
    });
    return mailresponse;
};
exports.mailer = mailer;
//# sourceMappingURL=mailer.js.map