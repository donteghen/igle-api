"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const dbconfig_1 = require("./config/dbconfig");
// Router import
const user_1 = require("./routes/user");
const project_1 = require("./routes/project");
const request_1 = require("./routes/request");
const contact_1 = require("./routes/contact");
const report_1 = require("./routes/report");
//  initial app variables and instances
const app = (0, express_1.default)();
dotenv_1.default.config();
(0, dbconfig_1.connectDb)();
const port = process.env.PORT || 8080;
// define the express app middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// app.use(express.static(path.join(__dirname, '../client', 'build')))
app.use(user_1.UserRouter);
app.use(project_1.ProjectRouter);
app.use(request_1.RequestRouter);
app.use(contact_1.ContactRouter);
app.use(report_1.ReportRouter);
app.get('/api/', (req, res) => {
    res.send('welcome the autobazar api');
});
app.get("*", (req, res) => {
    res.redirect('/api/');
    // res.sendFile(path.join(__dirname, '../client', 'build', 'index.html'));
    // res.sendFile(path.join(__dirname, '../build', 'index.html'));
});
// start the express server
app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`server started at http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map