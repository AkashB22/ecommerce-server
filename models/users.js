let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let crypto = require('crypto');
let bcrypt = require('bcryptjs');
let jwt = require('jsonwebtoken');
let mongooseUniqueValidator = require('mongoose-unique-validator');

let userSchema = new Schema({
    email: {
        type: String,
        unique: true,
        uniqueCaseInsensitive: true,
        max: 255,
        min: 6
    },
    password: {
        type: String,
        select: false,
        min: 6,
        max: 1024
    },
    salt: {
        type: String,
        select: false,
        min: 6,
        max: 1024
    },
    username: {
        type: String,
        max: 255,
        min: 4
    },
    phone: {
        type: String,
        min: 10,
        max: 255
    },
    userProfile: {
        type: Schema.Types.ObjectId,
        ref: 'userprofile'
    },
    resetPasswordToken: {
        type: String,
        required: false
    },
    resetPasswordExpires: {
        type: String,
        required: false
    },
    creationDate: {
        type: Date,
        default: Date.now
    },
    updatedDate: {
        type: Date,
        default: Date.now
    },
    orders: {
        type: Schema.Types.ObjectId,
        ref: 'order'
    }
});

userSchema.plugin(mongooseUniqueValidator);

userSchema.pre('save', function(next){
    const user = this;
    if(!user.isModified('password')){
        return next();
    } else{
        bcrypt.genSalt(10, (err, salt)=>{
            bcrypt.hash(this.password, salt, (err, hash)=>{
                this.password = hash;
                this.salt = salt;
                return next();
            })
        })
    }
    
});

userSchema.methods.verifyPassword = function(password, callback){
    bcrypt.compare(password, this.password, function(err, res){
        callback(err, res);
    })
}

userSchema.methods.generateJWT = function(){
    return jwt.sign({
        id: this.id
    }, process.env.TOKEN_SECRET || 'mySecret', {expiresIn: '1h'});
}

userSchema.methods.generatePasswordReset = function(){
    this.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordExpires = Date.now() + 3600000;
    this.updatedDate = Date.now();
}

module.exports = mongoose.model('user', userSchema);