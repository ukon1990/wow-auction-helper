
const express = require('express'),
  router = express.Router()
AWS = require('aws-sdk'),
  url = require('url'),
  request = require('request'),
  secrets = require('../secrets/secrets');


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

router.get('/:spellID', (req, res) => {
  res.setHeader('content-type', 'application/json');
  request.get(`http://wowdb.com/api/spell/${req.params.spellID}`, (err, r, body) => {
    const recipe = convertWoWDBToRecipe(JSON.parse(body.slice(1, body.length - 1)));
    //res.send(recipe);
    getProfession(recipe, function (r) {
      res.send(r);
    });
  });
  // AWS.DynamoDB.
});

router.get('/update/:spellID', (req, res) => {
  res.setHeader('content-type', 'application/json');
  request.get(`http://wowdb.com/api/spell/${req.params.spellID}`, (err, r, body) => {
    const recipe = convertWoWDBToRecipe(JSON.parse(body.slice(1, body.length - 1)));
    //res.send(recipe);
    getProfession(recipe, function (r) {
      res.send(r);
    });
  });
  // AWS.DynamoDB.
});

router.get('*', (req, res) => {
  res.setHeader('content-type', 'application/json');
  // Get all pets
  res.send('All recipes');
});

function convertWoWDBToRecipe(wowDBRecipe) {
  const basePoints = wowDBRecipe.Effects[0].BasePoints,
    recipe = {
      spellID: wowDBRecipe.ID,
      itemID: wowDBRecipe.CreatedItemID,
      name: wowDBRecipe.Name,
      profession: 'none',
      rank: wowDBRecipe.Rank,
      minCount: basePoints > 0 ? basePoints : 1,
      maxCount: basePoints > 0 ? basePoints : 1,
      reagents: convertReagents(wowDBRecipe.Reagents)
    };
  return recipe;
}

function convertReagents(reagents) {
  const r = [];
  reagents.forEach(reagent => {
    r.push({ itemID: reagent.Item, name: '', count: reagent.ItemQty, dropped: false });
  });
  return r;
}

function getProfession(recipe, callback) {
  request.get(`https://eu.api.battle.net/wow/recipe/${recipe.spellID}?locale=en_GB&apiKey=${secrets.apikey}`, (err, r, body) => {
    recipe.profession = JSON.parse(body).profession;
    proscessReagents(recipe, 0, callback);
  });
}

function proscessReagents(recipe, nextIndex, callback) {
  if (nextIndex >= recipe.reagents.length) {
    callback(recipe);
  } else {
    request.get(`http://wowdb.com/api/item/${recipe.reagents[nextIndex].itemID}`, (err, r, body) => {
      const item = JSON.parse(body.slice(1, body.length - 1));

      recipe.reagents[nextIndex].name = item.Name;
      recipe.reagents[nextIndex].dropped = item && item.DroppedBy && item.DroppedBy.length > 0;

      proscessReagents(recipe, nextIndex + 1, callback);
    });
  }
}


module.exports = router;