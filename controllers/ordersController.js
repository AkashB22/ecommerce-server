let ordersController = {};

let ordersService = require('./../services/ordersService');

ordersController.create = async (req, res, next)=>{
    try {
        let userId = req.body.userId;
        let cartId = req.body.cartId;

        let orderObj = {
            userId,
            cartId
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

module.exports = ordersController;