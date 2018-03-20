const express = require('express'),
  router = express.Router(),
  url = require('url'),
  headers  = require('./headers'),
  secrets = require('../secrets/secrets'),
  locale = require('../locales'),
  requestPromise = require('request-promise'),
  PromiseThrottle = require('promise-throttle'),
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

router.get('/locale', (req, res) => {
  res = headers.setHeaders(res);
  const list = [];

  setMissingLocales(req, res)
    .then(r => res.send(r))
    .catch(e => console.error(`Could not get locale for x`, e));
});

router.get('/:id', (req, res) => {
  res = headers.setHeaders(res);

  try {
    const connection = mysql.createConnection(secrets.databaseConn);
    connection.query('SELECT * from pets where speciesId = ' + req.params.id, function (err, rows, fields) {
      try {
        if (!err && rows.length > 0) {
          connection.end();
          res.json(rows[0]);
        } else {
          request.get(`https://eu.api.battle.net/wow/pet/species/${req.params.id}?locale=en_GB&apikey=${secrets.apikey}`, (err, re, body) => {
            const pet = reducePet(body),
              query = `
              INSERT INTO pets (speciesId, petTypeId, creatureId,
                name, icon, description, source)
                VALUES (
                  ${ pet.speciesId },
                  ${ pet.petTypeId },
                  ${ pet.creatureId },
                  "${ safeifyString(pet.name) }",
                  "${ pet.icon }",
                  "${ safeifyString(pet.description) }",
                  "${ safeifyString(pet.source) }");`;

            res.json(pet);
            console.log(`${new Date().toString()} - Adding new pet to the DB: ${req.params.id} - SQL: ${query}`);

            connection.query(query,
              (err, rows, fields) => {
                if (err) {
                  console.error(`Could not add the species with the id ${req.params.id}`, err.sqlMessage);
                } else {
                  console.log(`Successfully added pet with speciesID ${req.params.id}`);
                  getPetLocale(pet.speciesId, req, res)
                    .then(p => console.log(`Added locale for pet ${ pet.name }`))
                    .catch(e => console.error(`Could not get locale for ${ pet.name }`, e));
                }
              });
            connection.end();
          });
        }
      } catch (e) {
        console.error(`Could not get the pet with the speciesID ${req.params.id}`, e);
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

  request.get(`https://eu.api.battle.net/wow/pet/species/${req.params.id}?locale=en_GB&apikey=${secrets.apikey}`, (err, re, body) => {
    const pet = reducePet(body),
      query = `
        UPDATE pets
          SET
            petTypeId = ${ pet.petTypeId},
            creatureId = ${ pet.creatureId},
            name = "${ safeifyString(pet.name)}",
            icon = "${ pet.icon}",
            description = "${ safeifyString(pet.description)}",
            source = "${ safeifyString(pet.source)}"
          WHERE speciesId = ${ pet.speciesId };`;

    res.json(pet);
    console.log(`${new Date().toString()} - Updating pet with speciesID: ${req.params.id} - SQL: ${ query }`);

    const connection = mysql.createConnection(secrets.databaseConn);
    connection.query(query,
      (err, rows, fields) => {
        if (err) {
          console.error(`Could not update the pet with the speciesId ${req.params.id}`, err.sqlMessage);
        } else {
          console.log(`Successfully updated pet with speciesId ${req.params.id}`);
        }
      });
    connection.end();
  });
});

router.get('*', (req, res) => {
  res = headers.setHeaders(res);

  // Get all pets
  const connection = mysql.createConnection(secrets.databaseConn);
  connection.query(`
    SELECT p.speciesId, petTypeId, creatureId, ${ locale.getLocale(req) } as name, icon, description, source 
    FROM pets as p, pet_name_locale as l 
    WHERE l.speciesId = p.speciesId;`, function (err, rows, fields) {
    connection.end();
    res.setHeader('content-type', 'application/json');
    if (!err) {
      res.json({
        'pets': rows
      });
    } else {
      console.log('The following error occured while querying DB:', err);
    }
  });
});

function reducePet(pet) {
  pet = JSON.parse(pet);
  return {
    speciesId: pet.speciesId,
    petTypeId: pet.petTypeId,
    creatureId: pet.creatureId,
    name: pet.name,
    canBattle: pet.canBattle,
    icon: pet.icon,
    description: pet.description,
    source: pet.source
  };
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

async function setMissingLocales(req, res) {
  // Limit to 9 per second
  return new Promise((reso, rej) => {
    const connection = mysql.createConnection(secrets.databaseConn);
    connection.query('select speciesId from pets where speciesId not in (select speciesId from pet_name_locale);', async (err, rows, fields) => {
      if (!err) {
        var promiseThrottle = new PromiseThrottle({
          requestsPerSecond: 1,
          promiseImplementation: Promise
        });

        const list = [];
        const speciesIDs = [];
        rows.forEach(row => {
          speciesIDs.push(
            promiseThrottle.add(() => {
              return new Promise((resolve, reject) => {
                getPetLocale(row.speciesId, req, res)
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
        await Promise.all(speciesIDs)
          .then(r => { })
          .catch(e => console.error(e));
        reso(list);
      } else {
        rej({});
      }
    });
  });
}

async function getPetLocale(speciesId, req, res) {
  let pet = {id: speciesId};
  const euPromises = ['en_GB', 'de_DE', 'es_ES', 'fr_FR', 'it_IT', 'pl_PL', 'pt_PT', 'ru_RU']
      .map(locale => requestPromise.get(`https://eu.api.battle.net/wow/pet/species/${speciesId}?locale=${locale}&apikey=${ secrets.apikey }`, (r, e, b) => {
        try {
          pet[locale] = JSON.parse(b).name;
        } catch(e) {
          pet[locale] = '404';
        }
      })),
    usPromises = ['en_US', 'es_MX', 'pt_BR']
      .map(locale => requestPromise.get(`https://us.api.battle.net/wow/pet/species/${speciesId}?locale=${locale}&apikey=${ secrets.apikey }`, (r, e, b) => {
        try {
          pet[locale] = JSON.parse(b).name;
        } catch(e) {
          pet[locale] = '404';
        }
      }));

  
  await Promise.all(euPromises).then(r => {
  }).catch(e => {
    //console.error(e);
  });

  try {
    const connection = mysql.createConnection(secrets.databaseConn),
      sql = `INSERT INTO pet_name_locale
      (speciesId,
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
      (${pet['id']},
        "${safeifyString(pet['en_GB'])}",
        "${safeifyString(pet['en_US'])}",
        "${safeifyString(pet['de_DE'])}",
        "${safeifyString(pet['es_ES'])}",
        "${safeifyString(pet['es_MX'])}",
        "${safeifyString(pet['fr_FR'])}",
        "${safeifyString(pet['it_IT'])}",
        "${safeifyString(pet['pl_PL'])}",
        "${safeifyString(pet['pt_PT'])}",
        "${safeifyString(pet['pt_BR'])}",
        "${safeifyString(pet['ru_RU'])}");`;

    connection.query(sql, (err, rows, fields) => {
        if (!err) {
          console.log(`Locale added to db for ${pet.en_GB}`);
        } else {
          console.error(`Locale not added to db for ${pet.en_GB}`, err);
        }
        connection.end();
      });
    //
  } catch (e) {
    //
  }

  return pet;
}

module.exports = router;
