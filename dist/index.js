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