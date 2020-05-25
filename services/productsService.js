let productsService = {};

let ProductsModel = require('../models/products');

productsService.create = async (productObj)=>{
    let product = new ProductsModel({
        name: productObj.name,
        imagePath: productObj.imagePath,
        description: productObj.description,
        discountPercent: productObj.discountPercent,
        availableQuantity: productObj.availableQuantity,
        price: productObj.price,
        category: productObj.category,
        seller: productObj.seller,
        isTrending: productObj.isTrending,
        isDiscounted: productObj.isDiscounted,
        offers: productObj.offers,
        sizes: productObj.sizes,
        colors: productObj.colors,
        averageRating: productObj.averageRating 
    });

    return await product.save();
}

productsService.update = async (product)=>{
    return await product.save();
}

productsService.readById = async function(id){
    return await ProductsModel.findById(id).lean();
}

productsService.getAllProducts = async function(){
    return await ProductsModel.find();
}

productsService.delete = async function(productId){
    return await ProductsModel.findByIdAndDelete(productId);
}

productsService.deleteByProductName = async function(productName){
    return await ProductsModel.deleteOne({name : productName});
}

module.exports = productsService;