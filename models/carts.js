let mongoose = require('mongoose');
let Schema = mongoose.Schema;


let CartSchema = new Schema({
    items: [{
        productId: {
            type: Schema.Types.ObjectId,
            ref: 'product'
        }, 
        quantity: Number
    }],
    totalQuantity : Number,
    totalPrice: Number,
    user: String,
    userSet: {
        type: Boolean,
        index: true
    }
}, 
{
    timestamps: true
});
CartSchema.index(
        {updatedAt: 1}, { 
        expireAfterSeconds : 60, 
        partialFilterExpression: {
            userSet: false
        }
        });

module.exports = mongoose.model('cart', CartSchema);