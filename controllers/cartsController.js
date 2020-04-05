let cartsController = {};

let cartsService = require('../services/cartsService');
let productsSerive = require('../services/productsService')

cartsController.addToCart = async function(req, res, next){
    let userId = req.body.userId//req.login._id
    let cartId = req.body.cartId;

    if(!cartId){
        let newCartObj = {};
        let productId = req.body.productId;
        let quantity = req.body.quantity;
        newCartObj.productId = productId;
        newCartObj.quantity  = quantity;
        newCartObj.totalQuantity = quantity;
        newCartObj.userSet = false;
        if(userId){
            newCartObj.userId = userId;
            newCartObj.userSet = true;
        }

        try {
            let product = await productsSerive.readById(productId);
            let productPrice = (product.isDiscounted)? product.price - (product.price * product.discountPercent /100) : product.price 
            
            newCartObj.totalPrice = productPrice * newCartObj.quantity;

            let savedCart = await cartsService.create(newCartObj);

            res.status(200).json({
                message: 'successfully added to the cart',
                cartId : savedCart.id
            });

        } catch (error) {
            next(error);
        }

    } else{
        try{
            let existingCart = await cartsService.read(cartId);
            if(existingCart){
                let productId = req.body.productId;
                let quantity = req.body.quantity;
                let existingProduct = false;
                
                existingCart.items.forEach(element => {
                    if(productId === element.productId.toString()){
                        element.quantity += quantity;
                        existingProduct = true;
                    }
                });

                if(!existingProduct){
                    existingCart.items.push({
                        productId, quantity
                    })
                }

                existingCart.totalQuantity = existingCart.totalQuantity + quantity;
                
                if(userId){
                    existingCart.userId = userId;
                    existingCart.userSet = true;
                }
                let product = await productsSerive.readById(productId);
                let productPrice = (product.isDiscounted)? product.price - (product.price * product.discountPercent /100) : product.price 

                existingCart.totalPrice = existingCart.totalPrice + (productPrice * quantity);

                let updateCart = await cartsService.update(existingCart);

                res.status(200).json({
                    message: 'successfully updated the cart',
                    cartId : updateCart.id
                });
            } else{
                res.status(401).json({message: "cart id not available"})
            }
        } catch (error) {
            next(error);
        }
    }
}

cartsController.readCart = async function(req, res, next){
    res.status(200).json({
        name : req.session.name
    });
}
module.exports = cartsController;