let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let userProfileSchema = new Schema({
    email: {
        type: String,
        unique: true,
        max: 255,
        min: 6
    },
    username: {
        type: String,
        max: 255,
        min: 6
    },
    phone: {
        type: String,
        min: 10,
        max: 255
    },
    user: {
        type: Schema.Types.ObjectId,
        unique: true,
        ref: 'user'
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('userprofile', userProfileSchema);
