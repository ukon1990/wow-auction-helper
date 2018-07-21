import logger from "./logger";
import dotenv from "dotenv";
import fs from "fs";

if (fs.existsSync(".env")) {
    logger.debug("Using .env file to supply config environment variables");
    dotenv.config({ path: ".env" });
}
export const ENVIRONMENT = process.env.NODE_ENV;
const prod = ENVIRONMENT === "production"; // Anything else is treated as 'dev'

export const DATABASE_CREDENTIALS = prod ? {
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
if (!DATABASE_CREDENTIALS.host) {
    logger.error("No DB connection string. Set the environment variables.");
    process.exit(1);
}
