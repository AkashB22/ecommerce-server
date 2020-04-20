let ordersController = {};

let ordersService = require('./../services/ordersService');
let cartsService = require('./../services/cartsService');

ordersController.create = async (req, res, next)=>{
    try {
        let userId = req.body.userId;
        let cartId = req.body.cartId;

        let cart = await cartsService.read(cartId);

        let orderObj = {
            userId,
            cart
        }
        
        let order = await ordersService.create(orderObj);

        res.status(200).json({
            message: 'order created successfully',
            order
        });
    } catch (error) {
        next(error);
    }
}

ordersController.read = async (req, res, next)=>{
    try {
        let orderId = req.params.id;
        let order = await ordersService.read(orderId);

        res.status(200).json({
            message: 'order sent successfully',
            order
        })    
    } catch (error) {
        next(error);
    }
} 

ordersController.update = async (req, res, next)=>{
    try {
        let orderId = req.params.id;
        let status = req.body.status;
        if(orderId && (status.indexOf('Placed') || status.indexOf('Pending') || status.indexOf('Shipping') || status.indexOf('Delivered'))){
            let order = await ordersService.read(orderId);
            order.status = status;

            let updatedOrder = await ordersService.update(order);

            res.status(200).json({
                message: 'order updated successfully',
                updatedOrder
            });  
        }  
    } catch (error) {
        next(error);
    }
}

ordersController.delete = async (req, res, next)=>{
    try {
        let orderId = req.params.id;
        
        if(orderId){
            
            let deletedOrder = await ordersService.delete(orderId);

            res.status(200).json({
                message: 'order deleted successfully',
                deletedOrder
            });  
        }  
    } catch (error) {
        next(error);
    }
}

module.exports = ordersController;