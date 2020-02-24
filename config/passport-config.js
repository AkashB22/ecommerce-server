module.exports = function(){
    let passport = require('passport');
    let LocalStrategy = require('passport-local').Strategy;
    let UserModel = require('./../models/users');

    passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done)=>{
        UserModel.findOne({email: email})
            .select({password : 1, email: 1})
            .exec((err, user)=>{
                if(err) done(err)
                else if(!user) done(false, null, {'info' : 'No user with that email'});
                else if(user){
                    user.verifyPassword(password, (err, isVerified)=>{
                        if(!isVerified) done(false, null, {'info': user.email + ' user password does not match'});
                        else if(isVerified) done(null, user);
                    })
                }
            })
    }))
};