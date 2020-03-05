var express = require('express');
let passport = require('passport');
var router = express.Router();

let UserModel = require('./../models/users');
let UserProfileModel = require('./../models/userProfile');
let lib = require('./../lib/authenticate');
let validate = require('./../lib/validation');
let emailHelper = require('./../lib/email');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* GET users listing. */
router.post('/signup', async function(req, res, next) {  
  //validation
  let {error} = validate.signupValidation(req);

  if(error){
    res.status(400).json({
      'info': 'Validation error in inputs',
      'error': error.details[0].message
    });
  } else{
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

    try{
      const savedUser = await newUser.save();
      let userProfile = new UserProfileModel({
        email: savedUser.email,
        username: savedUser.username,
        phone: savedUser.phone,
        user : savedUser._id
      });

      let savedUserProfile = await userProfile.save();
      
      savedUser.userProfile = savedUserProfile._id;

      let finalSavedUser = await savedUser.save();

      res.status(200).json({
        'info': 'user saved successfully',
        'token': finalSavedUser.generateJWT(),
        'expiresIn': 3600
      });
    } catch(err){
        res.status(500).json({
          'info': 'Mongo db validation errors',
          'error': err.message
        });
      }
  }  
});

/* GET users listing. */
router.post('/signin', function(req, res, next) {
  //Validation

  let {error} = validate.signinValidation(req.body);

  if(error){
    res.status(400).json({
      'info': 'Validation error in inputs',
      'error': error.details[0].message
    });
  } else{
    passport.authenticate('local', (err, user, info)=>{
      if(err && !user){
        res.status(500).json({
          'info': 'error on signing in',
          'error': err
        });
      } else if(info){
        res.status(400).json({
          'info': 'Error on authentication of user',
          'error': info
        });
      } else{
        res.status(200).json({
          'info': 'signin done successfully',
          'token': user.generateJWT(),
          'expiresIn': 3600
        });
      }
    })(req, res, next);
  }
});

router.put('/update', lib.authenticate, async (req, res)=>{
  let {error} = validate.updateValidation(req.body);

  if(error){
    res.status(400).json({
      'info': 'Validation error in inputs',
      'error': error.details[0].message
    });
  } else{
    let user = req.login;
    let email = (req.body.hasOwnProperty('email')) ? req.body.email : null;
    let password = (req.body.hasOwnProperty('password')) ? req.body.password : null;
    let username = (req.body.hasOwnProperty('username')) ? req.body.username : null;
    let phone = (req.body.hasOwnProperty('phone')) ? req.body.phone : null;

    if(!email && !password && !username && !phone){
      res.status(200).json({
        info: 'no data send to update user',
        error: 'missing data to update user'
      });
    } else{
      if((typeof password !== 'undefined' && password !== null)){
        user.password = password;
      }
      user.email = (typeof email !== 'undefined' && email !== null)? email : user.email;
      user.username = (typeof username !== 'undefined' && username !== null)? username : user.username;
      user.phone = (typeof phone !== 'undefined' && phone !== null)? phone : user.phone;
      user.updatedDate = Date.now();
      
      try{
        let updatedUser = await user.save();
        let userUpdatedProfile = await UserProfileModel.findOne({user: updatedUser._id});
        userUpdatedProfile.email = updatedUser.email;
        userUpdatedProfile.username = updatedUser.username;
        userUpdatedProfile.phone = updatedUser.phone;

        await userUpdatedProfile.save();
        res.status(200).json({
          info: 'User updated successfully',
          user: updatedUser
        });
      } catch(err){
        res.status(200).json({
          info: 'User updation Failed',
          error: err.message
        });
      }
    }
  }
});

//Forget password section
router.post('/forgetPassword', async function(req, res){
  let email = req.body.email;

  try{
    let user = await UserModel.findOne({email : email});
    if(!user){
      res.status(401).json({
        'info': 'User not found',
        'error': 'No user with the email'
      });
    } else{
      //generate and set reset password token and expiration
      user.generatePasswordReset();

      let resetUser = await user.save();

      let link = `http://${req.headers.host}/users/resetLink/${resetUser.passwordResetToken}`;
      let mailOption = {
        to: resetUser.email,
        from: process.env.FROM_EMAIL || 'ecommerce@gmail.com',
        subject: "Password reset request",
        text: `Hi ${resetUser.username}, \n
                Please click the below link ${link} to reset your password. \n\n
                If you did not request this, please ignore this email and your password will remain the same unchanged.\n`
      }
      console.log(mailOption);
      //let info = await emailHelper.sendEmail(mailOption);
      
      res.status(200).json({
        info: 'forget mail has been sent successfully',
        // mail: info
      });
    }
  } catch(e){
    res.status(500).json({
      'info': 'Error on forget password',
      'error': e.message
    });
  }
});

router.get('/resetPasswordLink/:resetPasswordToken', async (req, res) =>{
  let resetPasswordToken = req.params.resetPasswordToken;
  try{
    let user = await UserModel.findOne({resetPasswordToken, resetPasswordExpires: {$gt : Date.now()}}).select('email');
    if(!user){
      res.status(401).json({
        info: 'Reset link has been not a valid one',
        error: 'reset token has been expired or not a valid one'
      })
    } else{
      res.status(200).json({
        info: 'reset link is valid',
        user: user
      });
    }
  } catch(e){
    res.status(500).json({
      info: 'Internal server error',
      error: e.message
    });
  }
});

router.post('/resetPassword/:resetPasswordToken', async (req, res)=>{
  let resetPasswordToken = req.params.resetPasswordToken;
  try{
    let user = await UserModel.findOne({resetPasswordToken, resetPasswordExpires: {$gt : Date.now()}});
    if(!user){
      res.status(500).json({
        info: 'Reset link has been not a valid one',
        error: 'reset token has been expired or not a valid one'
      })
    } else{
      let newPassword = req.body.password;
      let {error} = validate.resetPasswordValidation(req.body);

      if(error){
        res.status(401).json({
          info: 'Password validation failed',
          error: error.details[0].message
        });
      } else{
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        resettedUser = await user.save();

        const mailOption = {
          from: 'ecommerce@gmail.com',
          to: resettedUser.email,
          subject: 'Your password has been changed',
          text: `Hi ${resettedUser.username},\n
                  This is the confirmation that your password for your account ${resettedUser.email} has been reset successfully`
        }

        console.log(mailOption);
        //let info = await emailHelper.sendEmail(mailOption);
        delete resettedUser._doc.password;
        delete resettedUser._doc.salt;

        res.status(200).json({
          info: 'Password has been changed successfully',
          token: resettedUser.generateJWT(),
          expiresIn: 3600
        });
      }
    }
  } catch(e){
    res.status(500).json({
      info: 'Internal server error',
      error: e.message
    });
  }
})
/* GET user details. */
router.get('/profile', lib.authenticate, function(req, res, next) {
  let userDetails = UserModel.findOne({email: req.login.email})
    .populate('userProfile')
    .select("-_id -__v")
    .exec((err, user)=>{
      if(err){
        res.status(500).json({
          'info': 'Internal server error to find userprofile',
          'error': err
        });
      } else{
        res.status(200).json({
          'info': 'Authorised user to get user details',
          'user': user
        });
      }
    })
});


module.exports = router;
