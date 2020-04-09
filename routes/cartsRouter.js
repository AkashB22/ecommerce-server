let express = require('express');
let router = express.Router();

let cartsController = require('../controllers/cartsController');
let lib = require('./../lib/authenticate');

router.post('/', cartsController.create);

router.get('/:id', cartsController.read);

router.put('/:id', cartsController.update);

router.delete('/:id', cartsController.delete);

module.exports = router;