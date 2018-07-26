const express = require('express'),
  router = express.Router(),
  request = require('request'),
  auctionRouter = require('./auctions'),
  petRouter = require('./pets'),
  recipeRouter = require('./recipes'),
  itemRouter = require('./items');

// Error handling
const sendError = (err, res) => {
  response.status = 501;
  response.message = typeof err == 'object' ? err.message : err;
  res.status(501).json(response);
};

// Response handling
let response = {
  status: 200,
  data: [],
  message: null
};

// Pets
router.use('/pet', petRouter);

// Recipes
router.use('/recipe', recipeRouter);

// Items
router.use('/item', itemRouter);

// Auctions
router.use('/auction', auctionRouter);

module.exports = router;
