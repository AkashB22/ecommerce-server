let router = require('express').Router();

let productsController = require('../controllers/productsController');

router.post('/', productsController.createProduct);

router.get('/', productsController.getAllProducts);

router.get('/:id', productsController.getParticularProduct);

router.put('/:id', productsController.updateParticularProduct);

router.put('/images/:id', productsController.updateImagesForProduct);

router.delete('/:id', productsController.deleteParticularProduct);

module.exports = router;
