let cartService = {};

let [CartsModel, CartsSchema] = require('../models/carts');

cartService.create = async function(cartObj){
    let cart = new CartsModel({
        items: [{
            productId: cartObj.productId, 
            quantity: cartObj.quantity
        }],
        totalQuantity : cartObj.totalQuantity,
        totalPrice: cartObj.totalPrice,
        userSet: cartObj.userSet,
        user : cartObj.userId ? cartObj.userId : undefined
    });

    let savedCart = await cart.save();

    return savedCart;
}

cartService.readByPopulate = async function (id){
    // let cart = await (await CartsModel.findById(id).populate('items.productId')).populate('user').execPopulate();
    let cart = await CartsModel.findById(id).populate('items.productId').exec();
    return cart;
}

cartService.read = async function (id){
    // let cart = await (await CartsModel.findById(id).populate('items.productId')).populate('user').execPopulate();
    let cart = await CartsModel.findById(id);
    return cart;
}

cartService.update = async function(updatedCart){
    return await updatedCart.save();
}

cartService.delete = async function (id){
    return await CartsModel.findByIdAndDelete(id);
}

module.exports = cartService;