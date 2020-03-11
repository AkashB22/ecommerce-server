let express = require('express');
let router = express.Router();

let cartController = require('./../controllers/cartController');

router.post('/add-to-cart', cartController.addToCart);

router.get('/read', function(req, res, next){
    res.status(200).json({
        name : req.session.name
    });

});

module.exports = router;