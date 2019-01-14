import express from 'express';
import compression from 'compression'; // compresses requests
import bodyParser from 'body-parser';
import lusca from 'lusca';
import dotenv from 'dotenv';
import expressSession from 'express-session';
import path from 'path';
import expressValidator from 'express-validator';
// Controllers (route handlers)
import * as apiController from './controllers/api';
import * as itemController from './controllers/item.controller';
import * as recipeController from './controllers/recipe.controller';
import * as petController from './controllers/pet.controller';
import * as auctionController from './controllers/auction.controller';
import * as characterController from './controllers/character.controller';
import {getRealmStatus} from './controllers/realm.controller';
import {AuthUtil} from './util/auth.util';

// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config({path: '.env.example'});

// Create Express server
const app = express();

// Express configuration
app.set('port', process.env.PORT || 3000);
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressValidator());
app.use(expressSession({
  cookie: {maxAge: 60000},
  secret: 'null'
}));
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(
  express.static(path.join(__dirname, 'public'), {maxAge: 31557600000})
);


/**
 * API examples routes.
 */
app.get('/api', apiController.getApi);

if (process.env.NODE_ENV !== 'production') {
  // For import
  app.get('/api/item/from-list', itemController.getItemsFromList);
  app.get('/api/recipe/from-list', recipeController.getItemsToAdd);
}


// Item
app.get('/api/item', itemController.getItems);
app.post('/api/item', itemController.postItems);
app.patch('/api/item', itemController.updateItems);
app.get('/api/item/:id', itemController.getItem);
app.patch('/api/item/:id', itemController.updateItem);
app.options('/api/item/:id', itemController.updateItem);
app.get('/api/item/wowdb/:id', itemController.getWoWDBItem);
app.get('/api/item/source/:id', itemController.getItemSources);

// Recipes
app.get('/api/recipe', recipeController.postRecipes);
app.post('/api/recipe', recipeController.postRecipes);
app.get('/api/recipe/:id', recipeController.getRecipe);
app.patch('/api/recipe/:id', recipeController.patchRecipes);
app.options('/api/recipe/:id', recipeController.patchRecipes);

// Pets
app.get('/api/pet', petController.postPets);
app.post('/api/pet', petController.postPets);
app.get('/api/pet/:id', petController.getPet);
app.patch('/api/pet/:id', petController.patchPet);
app.options('/api/pet/:id', petController.patchPet);

// Auctions
app.post('/api/auction', auctionController.getAuctions);
app.get('/api/auction/:region/:realm', auctionController.getSnapshotForRealm);
app.post('/api/auction/wowuction', auctionController.getWoWUction);

// Character
app.post('/api/character', characterController.postCharacter);

// Realm status
app.get('/api/realm/:region', getRealmStatus);

/**
 * Primary app routes.
 */
app.get('*', (req, res) => {
  const url = req.originalUrl;
  if (url.indexOf('.php') === -1) {
    res.sendFile(path.join(__dirname, 'public/index.html'));
  } else {
    console.log('redirecting', url);
    // The client is using cache and thus old api endpoint
    if (url.indexOf('.php') !== -1 || url.toLowerCase().indexOf('phpmyadmin') !== -1) {
      console.log(`Attempted php vulnerability check @ ${new Date().toString()} and path: ${url}`);
      res.status(404).send('Not found');
    }
  }
});

app.post('*', (req, res) => {
  console.log(`Attempted post vulnerability check @ ${new Date().toString()}. Contents was ${JSON.stringify(req.body)}`);
  res.status(404).send('Not found');
});

AuthUtil.init();

export default app;
