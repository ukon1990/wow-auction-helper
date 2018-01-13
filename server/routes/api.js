const express = require('express'),
  router = express.Router(),
  request = require('request'),
  petsRoutes = require('./pets');

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

// Pets
router.get('/pet', (req, res, next) => {
  res.send('pets');
});

router.get('/auction', (req, res, next) => {
  const url = req.query.url;
	res.setHeader('content-type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
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
