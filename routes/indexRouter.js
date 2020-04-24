var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  req.locale = 'de';
  let msg = req.__('Hello');
  res.render('index', { title: msg });
});

module.exports = router;
