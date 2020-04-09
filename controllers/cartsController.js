let cartsController = {};

let cartsService = require('../services/cartsService');
let productsService = require('../services/productsService')

cartsController.create = async function(req, res, next){
    let userId = req.body.userId;//req.login._id
    let cart = {};
    let productId = req.body.productId;
    let quantity = req.body.quantity;

    cart.productId = productId;
    cart.quantity  = quantity;
    cart.totalQuantity = quantity;
    cart.userSet = false;
    if(userId){
        cart.userId = userId;
        cart.userSet = true;
    }

    try {
        let product = await productsService.readById(productId);
        let productPrice = (product.isDiscounted)? product.price - (product.price * product.discountPercent /100) : product.price 
        
        cart.totalPrice = productPrice * quantity;

        let savedCart = await cartsService.create(cart);

        res.status(200).json({
            message: 'successfully added to the cart',
            cart : savedCart
        });

    } catch (error) {
        next(error);
    }
    // else{
    //     try{
    //         let existingCart = await cartsService.read(cartId);
    //         if(existingCart){
    //             let productId = req.body.productId;
    //             let quantity = req.body.quantity;
    //             let existingProduct = false;
                
    //             existingCart.items.forEach(element => {
    //                 if(productId === element.productId.toString()){
    //                     element.quantity += quantity;
    //                     existingProduct = true;
    //                 }
    //             });

    //             if(!existingProduct){
    //                 existingCart.items.push({
    //                     productId, quantity
    //                 })
    //             }

    //             existingCart.totalQuantity = existingCart.totalQuantity + quantity;
                
    //             if(userId){
    //                 existingCart.userId = userId;
    //                 existingCart.userSet = true;
    //             }
    //             let product = await productsService.readById(productId);
    //             let productPrice = (product.isDiscounted)? product.price - (product.price * product.discountPercent /100) : product.price 

    //             existingCart.totalPrice = existingCart.totalPrice + (productPrice * quantity);

    //             let updateCart = await cartsService.update(existingCart);

    //             res.status(200).json({
    //                 message: 'successfully updated the cart',
    //                 cartId : updateCart.id
    //             });
    //         } else{
    //             res.status(401).json({message: "cart id not available"})
    //         }
    //     } catch (error) {
    //         next(error);
    //     }
    // }
}

cartsController.read = async function(req, res, next){
    let cartId = req.params.id;

    try {
        let cart = await cartsService.readByPopulate(cartId);

        res.status(200).json({
            message: "Got your cart",
            cart
        })
    } catch (error) {
        next(error);
    }
}

cartsController.update = async (req, res, next)=>{
    let cartId = req.params.id;
    // let userId = req.body.userId;//req.login._id
    let productId = req.body.productId;
    let quantity = req.body.quantity;

    try {
        let cart = await cartsService.read(cartId);
        let product = await productsService.readById(productId);
        let productPrice = (product.isDiscounted)? product.price - (product.price * product.discountPercent /100) : product.price 
        let isExistingProduct = false;

        cart.totalQuantity += quantity;
        cart.totalPrice += productPrice * quantity;
        cart.items.forEach((item)=>{
            if(item.productId.toString() === productId){
                isExistingProduct = true;
                item.quantity += quantity;
            }
        });

        if(!isExistingProduct){
            cart.items.push({
                productId,
                quantity
            })
        }

        let updatedCart = await cartsService.update(cart)

        res.status(200).json({
            message: "Got your cart",
            cart: updatedCart
        })
    } catch (error) {
        next(error);
    }
}

cartsController.delete = async (req, res, next)=>{
    try {
        let cartId = req.params.id;

        let deletedCart = await cartsService.delete(cartId);

        res.status(200).json({
            message: 'Cart successfully deleted',
            deletedCart
        })
    } catch (error) {
        next(error)
    }
}
module.exports = cartsController;