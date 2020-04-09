let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let ordersSchema = new Schema({
    userId : {
        type: Schema.types.ObjectId,
        ref: 'user'
    },
    cart:[
        {
            type: Schema.types.ObjectId,
            ref: 'cart' 
        }
    ],
    status: String
}, {
    timestamps: true
});

module.exports = mongoose.model('order', ordersSchema);