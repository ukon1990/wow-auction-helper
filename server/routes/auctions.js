const express = require('express'),
  router = express.Router(),
  headers  = require('./headers'),
  url = require('url'),
  request = require('request'),
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

router.get('*', (req, res) => {
  const url = req.query.url;
  res = headers.setHeaders(res);

  if (url) {
    request(url).pipe(res);
  } else {
    return {
      realms: [],
      auctions: []
    }
  }
});

module.exports = router;