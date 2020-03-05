let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let orderSchema = new Schema({
    userId : {
        type: Schema.types.ObjectId,
        ref: 'users'
    },
    products: {
        [
            type: Schema.types.ObjectId,
            ref: 'products'
        ]
    },
    date: {
        type: Date,
        default: Date.now;
    }
});

module.exports = mongoose.model('order', orderSchema);