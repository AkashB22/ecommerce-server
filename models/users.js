let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let bcrypt = require('bcryptjs');
let jwt = require('jsonwebtoken');
let userProfileModel = require('./../models/userProfile');

let userSchema = new Schema({
    email: {
        type: String,
        unique: true
    },
    password: {
        type: String,
        select: false
    },
    username: String,
    phone: String,
    salt: {
        type: String,
        select: false
    },
    userProfile: {
        type: Schema.Types.ObjectId,
        ref: 'userprofile'
    }
});

userSchema.pre('save', function(next){
    bcrypt.genSalt(10, (err, salt)=>{
        bcrypt.hash(this.password, salt, (err, hash)=>{
            this.password = hash;
            this.salt = salt;
            next();
        })
    })
});

userSchema.pre('findOneAndUpdate', function(next){
    if(typeof this._update.password !== 'undefined' || this._update.password !== null){
        bcrypt.genSalt(10, (err, salt)=>{
            bcrypt.hash(this._update.password, salt, (err, hash)=>{
                this._update.password = hash;
                this._update.salt = salt;
                next();
            })
        })
    } else{
        next();
    }
});
userSchema.post('findOneAndUpdate', function(){
    let userProfile = new userProfileModel({
        email: this.email,
        username: this.username,
        phone: this.phone,
        user : this._id
    });

    userProfile.findOneAndUpdate({email : this.email}, userProfile, err=> {
        if(err){
            console.log('error on post saving of userprofile data ' + err);
        }
    });
});

userSchema.post('save', function(){
    let userProfile = new userProfileModel({
        email: this.email,
        username: this.username,
        phone: this.phone,
        user : this._id
    });

    userProfile.save(err=> {
        if(err){
            console.log('error on post saving of userprofile data ' + err);
        }
    });
});

userSchema.methods.verifyPassword = function(password, callback){
    bcrypt.compare(password, this.password, function(err, res){
        callback(err, res);
    })
}

userSchema.methods.generateJWT = function(){
    return jwt.sign({
        id: this.id
    }, 'mySecret', {expiresIn: '1h'});
}

module.exports = mongoose.model('user', userSchema);