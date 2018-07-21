import express from "express";
import compression from "compression";  // compresses requests
import bodyParser from "body-parser";
import logger from "./util/logger";
import lusca from "lusca";
import dotenv from "dotenv";
import flash from "express-flash";
import expressSession from "express-session";
import path from "path";
import expressValidator from "express-validator";
import bluebird from "bluebird";

// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config({ path: ".env.example" });

// Controllers (route handlers)
import * as apiController from "./controllers/api";
import * as itemController from "./controllers/item.controller";
import * as recipeController from "./controllers/recipe.controller";
import * as petController from "./controllers/pet.controller";
import * as auctionController from "./controllers/auction.controller";

// Create Express server
const app = express();

// Express configuration
app.set("port", process.env.PORT || 3000);
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(expressSession({
  cookie: { maxAge: 60000 },
  secret: "null"
}));
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));

app.use(
  express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
);


/**
 * API examples routes.
 */
app.get("/api", apiController.getApi);
app.get("/api/item", itemController.getItems);
app.get("/api/recipe", recipeController.getRecipes);
app.get("/api/pet", petController.getPets);
app.get("/api/auction", auctionController.getAuctions);

/**
 * Primary app routes.
 */
// app.get("*", homeController.index);

export default app;