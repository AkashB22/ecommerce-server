let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let ProductSchema = new Schema({
    name: String,
    imagePath: [String],
    description: {
        type: String,
        default: 0
    },
    discountPercent: {
        type: Number,
        default: 0
    },
    availableQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        default: 0
    },
    category: {
        type: String
    },
    seller: String,
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'reviews'
    }],
    isTrending: Boolean,
    isDiscounted: Boolean,
    offers: [String],
    sizes: [String],
    colors: [String],
    averageRating: Number    
}, 
{
    timestamps: true
});

module.exports = mongoose.model('product', ProductSchema)