var express = require('express');
var router = express.Router();
var db = require('../lib/db');

/* GET logs listing. */
router.get('/', function(req, res, next) {
  const { logs } = db.value();
  res.json({ logs });
});

module.exports = router;
