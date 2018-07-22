"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("./logger"));
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
if (fs_1.default.existsSync(".env")) {
    logger_1.default.debug("Using .env file to supply config environment variables");
    dotenv_1.default.config({ path: ".env" });
}
exports.ENVIRONMENT = process.env.NODE_ENV;
const prod = exports.ENVIRONMENT === "production"; // Anything else is treated as 'dev'
exports.BLIZZARD_API_KEY = prod ?
    process.env["BLIZZARD_API_KEY"] : process.env["BLIZZARD_API_KEY_LOCAL"];
exports.DATABASE_CREDENTIALS = prod ? {
    host: process.env["MYSQL_URI"],
    user: process.env["MYSQL_USER"],
    password: process.env["MYSQL_PASSWORD"],
    database: process.env["MYSQL_SCHEMA"]
} : {
    host: process.env["MYSQL_URI_LOCAL"],
    user: process.env["MYSQL_USER_LOCAL"],
    password: process.env["MYSQL_PASSWORD_LOCAL"],
    database: process.env["MYSQL_SCHEMA"]
};
if (!exports.DATABASE_CREDENTIALS.host) {
    logger_1.default.error("No DB connection string. Set the environment variables.");
    process.exit(1);
}
//# sourceMappingURL=secrets.js.map