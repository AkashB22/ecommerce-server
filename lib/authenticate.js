let jwt = require('jsonwebtoken');
let UserModel = require('./../models/users');
let lib = {}

lib.authenticate = function(req, res, next){
    let token = req.headers['authorization'];
    if(token){
       jwt.verify(token.split(' ')[1], process.env.TOKEN_SECRET || 'mySecret', (err, decoded)=>{
           if(err){
               res.status(401).json({
                    'info' : 'Token Validation failed',
                    'error' : 'Not a valid token'
                });
           } else{
               let userId = decoded.id;
               if(userId){
                   UserModel.findById(userId, (err, user)=>{
                       if(err){
                           res.status(500).json({
                                'info' : 'Internal server error',
                                'error' : err
                            });
                       } else if(!user){
                           res.status(401).json({
                                'info' : 'Misuse of token',
                                'error' : 'No user found for the token'
                            });
                       } else{
                           req.login = user;
                           res.setHeader('X-Auth-Token', token);
                           next();
                       }
                   })
               } else{
                   res.status(401).json({
                        'info' : 'Missing token id',
                        'error' : 'Error on decoding token id'
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