var express = require('express');
var fs = require('fs');
var countriesData = require('../data/countries.json');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  var reports = [];
  countriesData.countries.forEach((item, i) => {
    try {
      const reportString = fs.readFileSync(`./data/${item.tld}.json`);
      const report = JSON.parse(reportString);
      report.tld = item.tld;
      report.name = item.name;
      reports.push(report);
    } catch(err) {
      console.log(err);
      return;
    }
  });
  res.render('index', { title: 'Express', reports: reports });
});

module.exports = router;
