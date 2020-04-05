let cartService = {};

let CartModel = require('../models/carts');

cartService.create = async function(cartObj){
    let newCart = new CartModel({
        items: [{
            productId: cartObj.productId, 
            quantity: cartObj.quantity
        }],
        totalQuantity : cartObj.totalQuantity,
        totalPrice: cartObj.totalPrice,
        userSet: cartObj.userSet,
    });

    if(cartObj.userId){
        newCart.user = cartObj.userId;
    }

    let savedCart = await newCart.save();

    return savedCart;
}

cartService.read = async function (id){
    return await CartModel.findById(id);
}

cartService.update = async function(updatedCart){
    return await updatedCart.save();
}

cartService.delete = async function (id){
    return await CartModel.deleteById(id);
}

module.exports = cartService;