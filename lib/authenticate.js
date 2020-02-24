let jwt = require('jsonwebtoken');
let UserModel = require('./../models/users');
let lib = {}

lib.authenticate = function(req, res, next){
    let token = req.headers['authorization'];
    if(token){
       jwt.verify(token.split(' ')[1], 'mySecret', (err, decoded)=>{
           if(err){
               res.status(401).json({
                    'info' : 'Internal error with token',
                    'err' : 'Error on decoding token'
                });
           } else{
               let userId = decoded.id;
               if(userId){
                   UserModel.findById(userId, (err, user)=>{
                       if(err){
                           res.status(401).json({
                                'info' : 'Misuse of token',
                                'err' : 'No user found for the token'
                            });
                       } else{
                           req.login = user;
                           next();
                       }
                   })
               } else{
                   res.status(401).json({
                        'info' : 'Missing token id',
                        'err' : 'Error on decoding token id'
                    });
               }
           }
       });
    } else{
        res.status(401).json({
            'info' : 'Token is missing.',
            'err' : 'This is a protected page'
        })
    }
}

module.exports = lib;