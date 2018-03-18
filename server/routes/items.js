const express = require('express'),
  router = express.Router(),
  headers = require('./headers'),
  url = require('url'),
  request = require('request'),
  requestPromise = require('request-promise'),
  secrets = require('../secrets/secrets'),
  mysql = require('mysql');

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

router.get('/wowdb/:id', (req, res) => {
  res = headers.setHeaders(res);

  try {
    request.get(`http://wowdb.com/api/item/${req.params.id}`, (e, r, b) => {
      res.send(convertWoWDBToItem(JSON.parse(b.slice(1, b.length - 1))));
    });
  } catch (err) {
    res.json({});
    console.error(err);
  }
});

router.get('/locale', (req, res) => {
  res = headers.setHeaders(res);

  shit(req, res);
});

async function shit(req, res) {
  let list = {};
  const euPromises = ['en_GB', 'de_DE', 'es_ES', 'fr_FR', 'it_IT', 'pl_PL', 'pt_PT', 'ru_RU']
    .map(locale => requestPromise.get(`https://eu.api.battle.net/wow/item/25?locale=${locale}&apikey=${secrets.apikey}`, (e, r, b) => {
      list[locale] = JSON.parse(b).name;
    }));/*,
    usPromises = ['en_US', 'es_MX', 'pt_BR']
      .map(async locale => {} )*/

  
  await Promise.all(euPromises).then(r => {
  }).catch(e => console.error(e));
  console.log('List', list);
  res.send(list);
}

async function test() {
  const promises = [250, 500, 1000].map(ms => wait(ms));
  console.log('resolved to', await Promise.race(promises));
}

async function wait(ms) {
  await new Promise(resolve => setTimeout(() => resolve(), ms));
  console.log('waited', ms);
  return ms;
}

router.get('/:id', (req, res) => {
  res = headers.setHeaders(res);

  try {
    const connection = mysql.createConnection(secrets.databaseConn);
    connection.query('SELECT * from items where id = ' + req.params.id, function (err, rows, fields) {
      res.setHeader('content-type', 'application/json');
      try {
        if (!err && rows.length > 0) {
          connection.end();
          rows.forEach(r => {
            try {
              r.itemSource = JSON.parse(r.itemSource);
              r.itemSpells = []; // TODO: Fix some issues regarding this json in the DB - JSON.parse(r.itemSpells);
            } catch (err) {
              console.error(err);
            }
          });
          res.json(rows[0]);
        } else {
          request.get(`https://eu.api.battle.net/wow/item/${req.params.id}?locale=en_GB&apikey=${secrets.apikey}`, (err, re, body) => {
            const icon = JSON.parse(body).icon;
            request.get(`http://wowdb.com/api/item/${req.params.id}`, (e, r, b) => {
              let item = convertWoWDBToItem(JSON.parse(b.slice(1, b.length - 1)));
              item.icon = icon;

              const query = insertItemQuery(item);
              console.log(`${new Date().toString()} - Adding new item (${item.name}) - SQL: ${ query }`);
              connection.query(query, (err, r, body) => {
                if (err) {
                  console.error('SQL error in items', err);
                }
                connection.end();
              });
              res.send(item);
            });
          });
        }
      } catch (e) {
        console.error(`Could not get the item with the ID ${req.params.id}`, e);
        connection.end();
        res.json({});
      }
    });
  } catch (err) {
    res.json({});
    console.error(err);
  }
});

router.patch('/:id', (req, res) => {
  res = headers.setHeaders(res);

  try {
    request.get(`https://eu.api.battle.net/wow/item/${req.params.id}?locale=en_GB&apikey=${secrets.apikey}`, (err, re, body) => {
      const icon = JSON.parse(body).icon;
      request.get(`http://wowdb.com/api/item/${req.params.id}`, (e, r, b) => {
        let item = convertWoWDBToItem(JSON.parse(b.slice(1, b.length - 1)));
        item.icon = icon;

        const query = updateItemQuery(item),
          connection = mysql.createConnection(secrets.databaseConn);
        console.log(`${new Date().toString()} - Updated the item: (${item.name}) - SQL: ${ query }`);
        connection.query(query, (err, r, body) => {
          if (err) {
            console.error('SQL error in items', err);
          }
          connection.end();
        });
        res.send(item);
      });
    });
  } catch (err) {
    connection.end();
    res.json({});
    console.error(`Could not update item with ID ${req.params.id}`, err);
  }
});

router.get('*', (req, res) => {
  res = headers.setHeaders(res);

  // Get all pets
  const connection = mysql.createConnection(secrets.databaseConn);
  connection.query('SELECT * from items', function (err, rows, fields) {
    connection.end();
    res.setHeader('content-type', 'application/json');
    if (!err) {
      rows.forEach(r => {
        try {
          r.itemSource = r.itemSource === '[]' ? [] : JSON.parse(r.itemSource.replace(/[\n]/g, ''));
          r.itemSpells = r.itemSpells === '[]' ? [] : []; // TODO: Fix some issues regarding this json in the DB - r.itemSpells
        } catch (err) {
          console.error(err, r.id);
        }
      });
      res.json({
        'items': rows
      });
    } else {
      console.error(`${new Date().toString()} - The following error occured while querying DB`, err);
    }
  });
});

function convertWoWDBToItem(item) {
  const i = {
    id: item.ID,
    name: item.Name,
    icon: item.Icon,
    itemLevel: item.Level,
    itemClass: item.Class,
    itemSubClass: item.Subclass,
    quality: item.Quality,
    itemBind: parseInt(item.BindType, 10),
    sellPrice: item.SellPrice,
    buyPrice: item.BuyPrice,
    itemSpells: item.Spells ? item.Spells : [],
    itemSources: item.DroppedBy ? item.DroppedBy : [],
    minFactionId: '0',
    minReputation: parseInt(item.RequiredFactionStanding, 10),
    isDropped: item.DroppedBy ? item.DroppedBy.length > 0 : false
  };
  return i;
}

function insertItemQuery(item) {
  return `INSERT INTO items VALUES(${
    item.id
    },"${
    safeifyString(item.name)
    }", "${
    item.icon
    }", ${
    item.itemLevel
    }, ${
    item.itemClass
    }, ${
    item.itemSubClass
    }, ${
    item.quality
    }, "${
    item.itemSpells ? safeifyString(JSON.stringify(item.itemSpells)) : '[]'
    }", "${
    item.itemSource ? safeifyString(JSON.stringify(item.itemSource)) : '[]'
    }", ${
    item.buyPrice
    }, ${
    item.sellPrice
    }, ${
    item.itemBind
    }, ${
    item.minFactionId
    }, ${
    item.minReputation
    }, ${
    item.isDropped
    }
    ,CURRENT_TIMESTAMP);`;
}

function updateItemQuery(item) {
  // itemSource = <{itemSource: }>,
  return `UPDATE items
    SET
      name = "${ safeifyString(item.name)}",
      icon = "${ item.icon}",
      itemLevel = ${ item.itemLevel},
      itemClass = ${ item.itemClass},
      itemSubClass = ${ item.itemSubClass},
      quality = ${ item.quality},
      itemSpells = "${
    item.itemSpells ? safeifyString(JSON.stringify(item.itemSpells)) : '[]'}",
      buyPrice = ${ item.buyPrice},
      sellPrice = ${ item.sellPrice},
      itemBind = ${ item.itemBind},
      minFactionId = ${ item.minFactionId},
      minReputation = ${ item.minReputation},
      isDropped = ${ item.isDropped},
      timestamp = CURRENT_TIMESTAMP
    WHERE id = ${item.id};`;
}

function safeifyString(str) {
  return str.replace(/[\']/g, '\'').replace(/[\"]/g, '\\"').replace(/\\\\\"/g, '\\\\\\"');
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