let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let ReviewSchema = new Schema({
    name: String,
    rating: Number,
    description: String
},
{
    timestamps: true
});

module.exports = mongoose.model('review', ReviewSchema);