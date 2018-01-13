
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
    res.send(body.slice(1, body.length - 1));
  });
  // AWS.DynamoDB.
});

router.get('*', (req, res) => {
  res.setHeader('content-type', 'application/json');
  // Get all pets
  res.send('All recipes');
});

module.exports = router;