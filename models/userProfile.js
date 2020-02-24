let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let userProfileSchema = new Schema({
    email: {
        type: String,
        unique: true
    },
    username: String,
    phone: String,
    user: {
        type: Schema.Types.ObjectId,
        unique: true,
        ref: 'user'
    }
});

module.exports = mongoose.model('userprofile', userProfileSchema);
