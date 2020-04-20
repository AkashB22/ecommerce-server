let router = require('express').Router();
let ordersController = require('./../controllers/ordersController');

router.post('/', ordersController.create);

router.get('/:id', ordersController.read);

router.put('/:id', ordersController.update);

router.delete('/:id', ordersController.delete);

module.exports = router;