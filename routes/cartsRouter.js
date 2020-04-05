let express = require('express');
let router = express.Router();

let cartController = require('../controllers/cartsController');
let lib = require('./../lib/authenticate');

router.post('/add', lib.authenticate, cartController.addToCart);

router.get('/read', cartController.readCart);

module.exports = router;