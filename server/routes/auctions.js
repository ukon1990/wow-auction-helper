const express = require('express'),
  router = express.Router()
  mysql = require('mysql'),
  url = require('url'),
  secrets = require('./secrets/secrets');
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

router.get('/:url', (req, res) => {
	res.setHeader('content-type', 'application/json');
	let u = "http://auction-api-eu.worldofwarcraft.com/auction-data/ce416c3089909442694ffb8c97a66ff4/auctions.json";
	request.get(u, (err, r, body) => {
		res.json(body);
	});
});