
const express = require('express'),
  router = express.Router(),
  headers  = require('./headers'),
  url = require('url'),
  request = require('request'),
  secrets = require('../secrets/secrets'),
  locale = require('../locales'),
  mysql = require('mysql'),
  requestPromise = require('request-promise'),
  PromiseThrottle = require('promise-throttle'),
  inTesting = false;


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

router.get('/locale', (req, res) => {
  res = headers.setHeaders(res);
  const list = [];

  setMissingLocales(req, res)
    .then(r => res.send(r))
    .catch(e => console.error(`Could not get locale for x`, e));
});

router.get('/:spellID', (req, res) => {
  res = headers.setHeaders(res);

  const connection = mysql.createConnection(secrets.databaseConn);
  connection.query(`SELECT json from recipes WHERE id = ${req.params.spellID}`, (err, rows, fields) => {
    try {
      if (!err && rows.length > 0) {
        try {
          connection.end();
        } catch (e) {
          console.error('Could not call end()', e);
        }

        rows.forEach(r => {
          try {
            res.json(JSON.parse(r.json));
          } catch (err) {
            console.error(err, r.json);
          }
        });
      } else {
        request.get(`http://wowdb.com/api/spell/${req.params.spellID}`, (err, r, body) => {
          const recipe = convertWoWDBToRecipe(JSON.parse(body.slice(1, body.length - 1)));
          //res.send(recipe);
          getProfession(recipe, function (r) {
            if (recipe.itemID > 0) {
              const query = `INSERT INTO recipes VALUES(${
                  req.params.spellID
                }, "${
                  safeifyString(JSON.stringify(recipe))
                }", CURRENT_TIMESTAMP);`;
              console.log(`${new Date().toString()} - Adding new recipe (${r.name}) - SQL: ${ query }`);
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
      console.error(`${new Date().toString()} - Getting a recipe failed for the spellID ${req.params.spellID}`, e);
    }
  });
});

router.patch('/:spellID', (req, res) => {
  res = headers.setHeaders(res);

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
          const connection = mysql.createConnection(secrets.databaseConn);
          connection.query(query, (err, r, body) => {
            if (err) {
              throw err;
            }
          })
          connection.end();
        } catch (e) {
          console.error(`${new Date().toString()} - Could not update ${req.params.spellID} - SQL: ${query}`, e);
        }
      }
        console.log(`${new Date().toString()} - Updating recipe ${r.name}(${r.spellID}) - SQL: ${ query }`);
        res.send(r);
      });
    } catch (e) {
      console.error('Fail', req.params.spellID, body);
      forceStopIfTest(err);
    }
  });
});

router.get('*', (req, res) => {
  res = headers.setHeaders(res);
  let recipe;

  const connection = mysql.createConnection(secrets.databaseConn);
  // select json, de_DE from recipes as r, recipe_name_locale as l where r.id = l.id;
  connection.query(`SELECT l.id, json, ${ locale.getLocale(req) } as name from  recipes as r, recipe_name_locale as l where r.id = l.id and json NOT LIKE '%itemID":0%';`, (err, rows, fields) => {
    if (!err) {
      let recipes = [];
      rows.forEach(r => {
        try {
          recipe = JSON.parse(r.json);
          recipe.name = r.name;
          recipes.push(recipe);
        } catch (err) {
          console.error(`${new Date().toString()} - Could not parse json (${r.id})`, r.json, err);
        }
      });
      res.json({ 'recipes': recipes });
    } else {
      console.log(`${new Date().toString()} - The following error occured while querying DB:`, err);
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

async function setMissingLocales(req, res) {
  // Limit to 9 per second
  return new Promise((reso, rej) => {
    const connection = mysql.createConnection(secrets.databaseConn);
    connection.query('select id from recipes where id not in (select id from recipe_name_locale);', async (err, rows, fields) => {
      if (!err) {
        var promiseThrottle = new PromiseThrottle({
          requestsPerSecond: 1,
          promiseImplementation: Promise
        });

        const list = [];
        const spellIDs = [];
        rows.forEach(row => {
          spellIDs.push(
            promiseThrottle.add(() => {
              return new Promise((resolve, reject) => {
                getRecipeLocale(row.id, req, res)
                  .then(r => {
                    list.push(r);
                    resolve(r);
                  })
                  .catch(e => {
                    console.error(e);
                    reject({});
                  });
              })
            }));
        });
        await Promise.all(spellIDs)
          .then(r => { })
          .catch(e => console.error(e));
        reso(list);
      } else {
        rej({});
      }
    });
  });
}

async function getRecipeLocale(spellID, req, res) {
  let recipe = {id: spellID};
  const euPromises = ['en_GB', 'de_DE', 'es_ES', 'fr_FR', 'it_IT', 'pl_PL', 'pt_PT', 'ru_RU']
      .map(locale => requestPromise.get(`https://eu.api.battle.net/wow/spell/${spellID}?locale=${locale}&apikey=${ secrets.apikey }`, (r, e, b) => {
        try {
          recipe[locale] = JSON.parse(b).name;
        } catch(e) {
          recipe[locale] = '404';
        }
      })),
    usPromises = ['en_US', 'es_MX', 'pt_BR']
      .map(locale => requestPromise.get(`https://us.api.battle.net/wow/spell/${spellID}?locale=${locale}&apikey=${ secrets.apikey }`, (r, e, b) => {
        try {
          recipe[locale] = JSON.parse(b).name;
        } catch(e) {
          recipe[locale] = '404';
        }
      }));

  
  await Promise.all(euPromises).then(r => {
  }).catch(e => {
    //console.error(e);
  });

  try {
    const connection = mysql.createConnection(secrets.databaseConn),
      sql = `INSERT INTO recipe_name_locale
      (id,
        en_GB,
        en_US,
        de_DE,
        es_ES,
        es_MX,
        fr_FR,
        it_IT,
        pl_PL,
        pt_PT,
        pt_BR,
        ru_RU)
      VALUES
      (${recipe['id']},
        "${safeifyString(recipe['en_GB'])}",
        "${safeifyString(recipe['en_US'])}",
        "${safeifyString(recipe['de_DE'])}",
        "${safeifyString(recipe['es_ES'])}",
        "${safeifyString(recipe['es_MX'])}",
        "${safeifyString(recipe['fr_FR'])}",
        "${safeifyString(recipe['it_IT'])}",
        "${safeifyString(recipe['pl_PL'])}",
        "${safeifyString(recipe['pt_PT'])}",
        "${safeifyString(recipe['pt_BR'])}",
        "${safeifyString(recipe['ru_RU'])}");`;

    connection.query(sql, (err, rows, fields) => {
        if (!err) {
          console.log(`Locale added to db for ${recipe.en_GB}`);
        } else {
          console.error(`Locale not added to db for ${recipe.en_GB}`, err);
        }
        connection.end();
      });
    //
  } catch (e) {
    //
  }

  return recipe;
}

module.exports = router;
