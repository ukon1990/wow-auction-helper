const express = require('express'),
  router = express.Router(),
  headers = require('./headers'),
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

router.get('/wowuction/:region/:realm/:key', (req, res) => {
  const key = req.query.key;
  // http://localhost:3000/wuc.tsv
  request.get(`http://www.wowuction.com/${
        req.params.region
      }/${
        req.params.realm
      }/alliance/Tools/RealmDataExportGetFileStatic?token=${
        req.params.key
      }`, (err, re, body) => {
    res = headers.setHeaders(res);
    const list = [];
    let obj = {},
      tempObj = {},
      isFirst = true;
    // 5 == itemID, 7 == market price,
    // 14 == Avg Daily Posted, 15 == Avg Estimated Daily Sold,
    // 16 == Estimated demand
    body.split('\n').forEach(l => {
      if (isFirst) {
        isFirst = false;
        // console.log(l.split('\t'));
      } else {
        tempObj = l.split('\t');
        list.push({
          id: parseInt(tempObj[4], 10),
          mktPrice: parseInt(tempObj[6]),
          avgDailyPosted: parseFloat(tempObj[15]),
          avgDailySold: parseFloat(tempObj[16]),
          estDemand: parseFloat(tempObj[17]),
          dailyPriceChange: parseFloat(tempObj[14])
        });
      }
    });
    res.send(list);
  });
});

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