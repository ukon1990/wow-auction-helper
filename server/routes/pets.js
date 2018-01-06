const express = require('express'),
  router = express.Router()
  mysql = require('mysql'),
  url = require('url'),
  secrets = require('../secrets/secrets');
let connection = mysql.createConnection(secrets.databaseConn);


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
  connection = startConnection();
  res.setHeader('content-type', 'application/json');
  connection.query('SELECT * from pets where speciesId = ' + req.params.id, function (err, rows, fields) {
    if (!err) {
      res.json(rows[0]);
    } else {
      console.log('The following error occured while querying DB:.', err);
    }
  });

  connection.end();
});

router.get('*', (req, res) => {
  connection = startConnection();
  res.setHeader('content-type', 'application/json');
  connection.query('SELECT * from pets', (err, rows, fields) => {
    if (!err) {
      res.json({ 'pets': rows });
    } else {
      console.log('The following error occured while querying DB:.', err);
    }
  });

  connection.end();
});