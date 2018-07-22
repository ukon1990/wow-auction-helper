"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
}
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const compression_1 = __importDefault(require("compression")); // compresses requests
const body_parser_1 = __importDefault(require("body-parser"));
const lusca_1 = __importDefault(require("lusca"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_session_1 = __importDefault(require("express-session"));
const path_1 = __importDefault(require("path"));
const express_validator_1 = __importDefault(require("express-validator"));
// Load environment variables from .env file, where API keys and passwords are configured
dotenv_1.default.config({ path: ".env.example" });
// Controllers (route handlers)
const apiController = __importStar(require("./controllers/api"));
const itemController = __importStar(require("./controllers/item.controller"));
const recipeController = __importStar(require("./controllers/recipe.controller"));
const petController = __importStar(require("./controllers/pet.controller"));
const auctionController = __importStar(require("./controllers/auction.controller"));
// Create Express server
const app = express_1.default();
// Express configuration
app.set("port", process.env.PORT || 3000);
app.use(compression_1.default());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(express_validator_1.default());
app.use(express_session_1.default({
    cookie: { maxAge: 60000 },
    secret: "null"
}));
app.use(lusca_1.default.xframe("SAMEORIGIN"));
app.use(lusca_1.default.xssProtection(true));
app.use(express_1.default.static(path_1.default.join(__dirname, "public"), { maxAge: 31557600000 }));
/**
 * API examples routes.
 */
app.get("/api", apiController.getApi);
app.get("/api/item", itemController.getItems);
app.get("/api/item/:id", itemController.getItem);
app.get("/api/recipe", recipeController.getRecipes);
app.get("/api/pet", petController.getPets);
app.get("/api/auction", auctionController.getAuctions);
/**
 * Primary app routes.
 */
// app.get("*", homeController.index);
exports.default = app;
//# sourceMappingURL=app.js.map