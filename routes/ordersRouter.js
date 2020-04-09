let router = require('express').Router();
let ordersController = require('./../controllers/ordersController');

router.post('/', ordersController.create);

module.exports = router;