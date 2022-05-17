"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailer = void 0;
const mail_1 = __importDefault(require("@sendgrid/mail"));
const mailer = (toEmail, subject, heading, detail, link) => {
    let mailresponse;
    mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
        to: `${toEmail}`,
        from: 'donaldteghen@gmail.com',
        subject: `${subject}`,
        text: 'and easy to do anywhere, even with Node.js',
        html: `
    <div style="padding:50px 0; background:#f9f9f9; text-align:center; margin:10px">
						<h1>Image Logo</h1>
                        <h4 style="text-decoration:underline; ">
                            <a href="www.autobazar.com.ca">autobazar.com.ca</a>
                        </h4>
                        <p>${heading}</p>
                        <h3 style="width:100%;">
                            <a style="padding:8px 10px; background:blue;
                            color: white; text-decoration:none; border-radius:4px;
                            border:none" href=${link}>${detail}
                            </a>
                        </h3>
                    </div>`,
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