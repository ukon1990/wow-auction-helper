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

router.get('/:id', (req, res) => {
  res.setHeader('content-type', 'application/json');

  try {
    connection = startConnection();
    connection.query('SELECT * from items where id = ' + req.params.id, function (err, rows, fields) {
      connection.end();
      res.setHeader('content-type', 'application/json');
      try {
        const dis = false;
        if (!err && rows.length > 0 && dis) {
          item.forEach(r => {
            try {
              r.itemSource = JSON.parse(r.itemSource);
              r.itemSpells = []; // TODO: Fix some issues regarding this json in the DB - JSON.parse(r.itemSpells);
            } catch (err) {
              console.log(err);
            }
          });
          res.json(item[0]);
        } else {
          request.get(`https://eu.api.battle.net/wow/item/${req.params.id}?locale=en_GB&apikey=${secrets.apikey}`, (err, re, body) => {
            const icon = JSON.parse(body).icon;
            console.log('Dat icon', icon);
            request.get(`http://wowdb.com/api/item/${req.params.id}`, (e, r, b) => {
              let item = convertWoWDBToItem(JSON.parse(b.slice(1, b.length - 1)));
              item.icon = icon;

              console.log(`Adding new item (${item.name})`, item);
              const query = `INSERT INTO items VALUES(${
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
              console.log('SQL', query);
              res.send(item);
              /*
              connection.query(query, (err, r, body) => {
                if (!err) {
                  connection.end();
                } else {
                  throw err;
                }
              });*/
            });
          });
        }
      } catch (e) {
        console.error(`Could not get the item with the ID ${req.params.id}`, e);
        res.json({});
      }
    });
  } catch (err) {
    res.json({});
    console.log(err);
  }
});

router.patch('/:id', (req, res) => {
  // TODO: Implement
  res.send({ message: 'Not implemented' });
});

router.get('*', (req, res) => {
  res.setHeader('content-type', 'application/json');
  // Get all pets
  connection = startConnection();
  connection.query('SELECT * from items', function (err, rows, fields) {
    connection.end();
    res.setHeader('content-type', 'application/json');
    if (!err) {
      rows.forEach(r => {
        try {
          r.itemSource = r.itemSource === '[]' ? [] : JSON.parse(r.itemSource.replace(/[\n]/g, ''));
          r.itemSpells = r.itemSpells === '[]' ? [] : []; // TODO: Fix some issues regarding this json in the DB - r.itemSpells
        } catch (err) {
          console.log(err, r.id);
        }
      });
      res.json({
        'items': rows
      });
    } else {
      console.log('The following error occured while querying DB:', err);
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