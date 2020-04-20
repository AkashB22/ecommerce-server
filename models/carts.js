let mongoose = require('mongoose');
let Schema = mongoose.Schema;


let CartsSchema = new Schema({
    items: [{
        productId: {
            type: Schema.Types.ObjectId,
            ref: 'product'
        }, 
        quantity: Number
    }],
    totalQuantity : Number,
    totalPrice: Number,
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    userSet: {
        type: Boolean
    }
}, 
{
    timestamps: true
});
CartsSchema.index({updatedAt: 1}, 
    { 
        expireAfterSeconds : 60, 
        partialFilterExpression: {
            userSet: false
        }
    });

module.exports = [mongoose.model('cart', CartsSchema), CartsSchema];