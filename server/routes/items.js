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
  res.send('Single item');
  // AWS.DynamoDB.
});

router.get('*', (req, res) => {
  res.setHeader('content-type', 'application/json');
  // Get all pets
  res.send('All items');
});

module.exports = router;