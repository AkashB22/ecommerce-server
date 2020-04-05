let productsService = {};

let ProductsModel = require('../models/products');

productsService.readById = async function(id){
    return await ProductsModel.findById(id);
}

productsService.getAllProducts = async function(){
    return await ProductsModel.find();
}

module.exports = productsService;