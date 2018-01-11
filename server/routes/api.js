const express = require('express'),
  router = express.Router(),
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
// app.use('/pets', petsRoutes);

module.exports = router;
