let ordersService = {}

let OrdersModel = require('./../models/orders');

ordersService.create = async (orderObj)=>{
    let order = new OrdersModel({
        userId: orderObj.userId,
        cart: orderObj.cart,
        status: 'Placed'
    })

    return await order.save();
}

ordersService.read = async (orderId)=>{
    // return await OrdersModel.findById(orderId).populate('cart.items.productId').exec();
    return await OrdersModel.findById(orderId);
}

ordersService.update = async (order)=>{
    return await order.save();
}

ordersService.delete = async (orderId)=>{
    return await OrdersModel.findByIdAndDelete(orderId);
}

module.exports = ordersService;