let mongoose = require('mongoose');
let [CartsModel, CartsSchema] = require('./carts');

let Schema = mongoose.Schema;

let ordersSchema = new Schema({
    userId : {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    cart: {
        type: CartsSchema,
        required: true
    },
    status: String
}, {
    timestamps: true
});

module.exports = mongoose.model('order', ordersSchema);