let productsController = {};

let productsService = require('../services/productsService');

productsController.getAllProducts = async (req, res, next)=>{
    try{
        let products = await productsService.getAllProducts();

        res.status(200).json({  
            info: "Fetched all products",
            products: products
        });
    } catch(e){
        res.status(500).json({
            info: 'Internal server error',
            error: e.message
        });
    }
}

module.exports = productsController;