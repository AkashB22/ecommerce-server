let router = require('express').Router();

let productsController = require('../controllers/productsController');

router.post('/', productsController.createProduct);

router.get('/', productsController.getAllProducts);

router.get('/:id', productsController.getParticularProduct);

router.put('/:id', productsController.updateParticularProduct);

router.delete('/:id', productsController.deleteParticularProduct);

router.put('/images/:id', productsController.updateImagesForProduct);

router.post('/image', productsController.sendImage);

router.post("/upload", productsController.uploadAfile);

module.exports = router;
