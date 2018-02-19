
const express = require('express'),
  router = express.Router()
url = require('url'),
  request = require('request'),
  secrets = require('../secrets/secrets'),
  mysql = require('mysql'),
  connection = mysql.createConnection(secrets.databaseConn),
  inTesting = true;


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
  res.setHeader('Access-Control-Allow-Origin', '*');
  connection = startConnection();

  connection.query(`SELECT json from recipes WHERE id = ${req.params.spellID}`, (err, rows, fields) => {
    try {
      if (!err && rows.length > 0) {
        connection.end();
        rows.forEach(r => {
          try {
            res.json(JSON.parse(r.json));
          } catch (err) {
            console.log(err, r.json);
          }
        });
      } else {
        request.get(`http://wowdb.com/api/spell/${req.params.spellID}`, (err, r, body) => {
          const recipe = convertWoWDBToRecipe(JSON.parse(body.slice(1, body.length - 1)));
          //res.send(recipe);
          getProfession(recipe, function (r) {
            if (recipe.itemID > 0) {
              console.log(`Adding new recipe (${r.name})`);
              const query = `INSERT INTO recipes VALUES(${
                  req.params.spellID
                }, "${
                  safeifyString(JSON.stringify(recipe))
                }", CURRENT_TIMESTAMP);`;
              console.log(query);
              connection.query(query, (err, r, body) => {
                if (!err) {
                  connection.end();
                } else {
                  throw err;
                }
              });
            }
            res.send(r);
          });
        });
      }
    } catch(e) {
      console.error(`Getting a recipe failed for the spellID ${req.params.spellID}`, e);
    }
  });
});

router.patch('/:spellID', (req, res) => {
  res.setHeader('content-type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  request.get(`http://wowdb.com/api/spell/${req.params.spellID}`, (err, r, body) => {
    try {
      const recipe = convertWoWDBToRecipe(JSON.parse(body.slice(1, body.length - 1)));
      //res.send(recipe);
      getProfession(recipe, function (r) {
      if (recipe.itemID > 0) {
        const query = `
          UPDATE recipes SET json = "${
            safeifyString(JSON.stringify(recipe))
          }", timestamp = CURRENT_TIMESTAMP
          WHERE id = ${
          req.params.spellID
          };`;
          console.log('SQL:', query);
        try {
          connection = startConnection();
          connection.query(query, (err, r, body) => {
            if (err) {
              throw err;
            }
          })
          connection.end();
        } catch (e) {
          console.error(`Could not update ${req.params.spellID} - ${query}`, e);
        }
      }
        console.log('Updating recipe', r.name, r.spellID);
        res.send(r);
      });
    } catch (e) {
      console.log('Fail', req.params.spellID, body);
      forceStopIfTest(err);
    }
  });
});

router.get('*', (req, res) => {
  res.setHeader('content-type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  connection = startConnection();
  connection.query(`SELECT id, json from recipes not like '%itemID":0%';`, (err, rows, fields) => {
    if (!err) {
      let recipes = [];
      rows.forEach(r => {
        try {
          recipes.push(JSON.parse(r.json));
        } catch (err) {
          console.error(`Could not parse json (${r.id})`, r.json, err);
        }
      });
      res.json({ 'recipes': recipes });
    } else {
      console.log('The following error occured while querying DB:.', err);
    }
  });

  connection.end();
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

function safeifyString(str) {
  return str.replace(/[\']/g, '\'').replace(/[\"]/g, '\\"').replace(/\\\\\"/g, '\\\\\\"');
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
    try {
      recipe.profession = JSON.parse(body).profession;
    } catch (e) {
      console.error(`Could not find a profession for ${recipe.spellId} - ${recipe.name}`, body, e);
      forceStopIfTest(err);
    }
    proscessReagents(recipe, 0, callback);
  });
}

function proscessReagents(recipe, nextIndex, callback) {
  if (nextIndex >= recipe.reagents.length) {
    callback(recipe);
  } else {
    request.get(`http://wowdb.com/api/item/${recipe.reagents[nextIndex].itemID}`, (err, r, body) => {
      try {
        const item = JSON.parse(body.slice(1, body.length - 1));

        recipe.reagents[nextIndex].name = item.Name;
        recipe.reagents[nextIndex].dropped = item && item.DroppedBy && item.DroppedBy.length > 0;

        proscessReagents(recipe, nextIndex + 1, callback);
      } catch (e) {
        console.error(`Could not get item ${recipe.reagents[nextIndex].itemID}`, body, e);
        forceStopIfTest(err);
      }
    });
  }
}

function startConnection() {
  return mysql.createConnection(secrets.databaseConn);
}

function forceStopIfTest(error) {
  if (inTesting) {
    throw error;
  }
}

module.exports = router;
