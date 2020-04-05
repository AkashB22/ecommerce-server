let router = require('express').Router();

let productsController = require('../controllers/productsController');

router.get('/', productsController.getAllProducts)


module.exports = router;
