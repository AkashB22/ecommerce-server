var express = require('express');
let UserModel = require('./../models/users');
let passport = require('passport');
var router = express.Router();
let lib = require('./../lib/authenticate');
let UserProfileModel = require('./../models/userProfile');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* GET users listing. */
router.post('/signup', function(req, res, next) {  
  let email = req.body.email,
    password = req.body.password,
    username = req.body.username,
    phone = req.body.phone;

  let newUser = new UserModel({
    email,
    password,
    username,
    phone
  });

  newUser.save((err, user)=>{
    if(err) {
      res.status(500).json({
        'info': 'error on saving the user',
        'error': err
        });
    } else{
      res.status(200).json({
        'info': 'user saved successfully',
        'token': user.generateJWT(),
        'userId': user._id,
        'expiresIn': 3600
      })
    }
  });
});

/* GET users listing. */
router.post('/signin', function(req, res, next) {
    passport.authenticate('local', (err, user, info)=>{
      if(err){
        res.status(500).json({
          'info': 'error on signing in',
          'err': err
        });
      } else if(!user){
        res.status(200).json({
          'info': info.info,
          'err': 'error due to user not found or password mismatch'
        });
      } else if(user){
        res.status(200).json({
          'info': 'signin done successfully',
          'token': user.generateJWT(),
          'userId': user._id,
          'expiresIn': 3600
        });
      }
    })(req, res, next);
});

router.put('/update', lib.authenticate, (req, res)=>{
  let email = req.body.email.trim();
  let username = req.body.username.trim();
  let password = req.body.password.trim();

  if(!email || !username || !password){
    res.status(200).json({
      'info': 'No new details to update',
      'err': 'Please provide values to update'
    });
  } else{
    let updateUserData = {
      email : (typeof email !== 'undefiend' && email !== null)? email : user.email,
      username : (typeof username !== 'undefiend' && username !== null)? username : user.username,
    }
    if(typeof password !== 'undefiend' && password !== null){
      updateUserData.password = password;
    }
  }  

  UserModel.findOneAndUpdate({email : req.login.email}, {$set: updateUserData}, (err, response)=>{
    if(err){
      res.status(500).json({
        'info': 'Error on updating user',
        'err': 'Not able to update'
      });
    } else{
      res.status(403).json({
        'info': 'Successfully updated',
        'user': response
      });
    }
  });
});

/* GET users listing. */
router.get('/profile', lib.authenticate, function(req, res, next) {
  UserProfileModel.findOne({email: req.login.email})
    .populate('user', "-_id -__v")
    .select("-_id -__v")
    .exec((err, user)=>{
      if(err){
        res.status(500).json({
          'info': 'Internal server error to find userprofile',
          'err': err
        });
      } else{
        res.status(200).json({
          'info': 'authorised user to get user details',
          'user': user
        });
      }
    })
});


module.exports = router;
