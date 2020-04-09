let ordersService = {}

let OrdersModel = require('./../models/orders');

ordersService.create = async (orderObj)=>{
    let order = new OrdersModel({
        userId: orderObj.userId,
        cart: orderObj.cartId
    })

    return await OrdersModel.save(order);
}

ordersService.read = async (orderId)=>{
    return await OrdersModel.findById(orderId);
}

ordersService.update = async (order)=>{
    return await order.save();
}

ordersService.delete = async (orderId)=>{
    return await OrdersModel.findByIdAndDelete(orderId);
}

module.exports = ordersService;