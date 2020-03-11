let productService = {};

let ProductModel = require('./../models/products');

productService.readById = async function(id){
    return await ProductModel.findById(id);
}

module.exports = productService;