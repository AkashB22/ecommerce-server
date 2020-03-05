let router = require('express').Router();

let ProductModel = require('./../models/products');

router.post('/products', (req, res)=>{
    res.send('protected by csrf');
});

router.get('/products', async (req, res)=>{
    try{
        let products = await ProductModel.find();
        res.setHeader('XSRF-TOKEN', req.csrfToken());

        res.status(200).json({  
            info: "Fetched all products",
            products: products
        })
    } catch(e){
        res.status(500).json({
            info: 'Internal server error',
            error: e.message
        });
    }
    
})


module.exports = router;
