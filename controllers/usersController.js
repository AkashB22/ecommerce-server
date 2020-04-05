let usersController = {};


let passport = require('passport');
let usersService = require('../services/usersService');
let userProfilesService = require('../services/userProfilesService');
let lib = require('../lib/authenticate');
let validate = require('../lib/validation');
let emailHelper = require('../lib/email');

usersController.signUp = async (req, res, next)=>{
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

    let userObj = {
      email,
      password,
      username,
      phone
    };

    try{
      const savedUser = await usersService.create(userObj);
      let userProfile = {
        email: savedUser.email,
        username: savedUser.username,
        phone: savedUser.phone,
        userId : savedUser._id
      };

      let savedUserProfile = await userProfilesService.create(userProfile);
      
      savedUser.userProfile = savedUserProfile._id;

      let finalSavedUser = await usersService.update(savedUser);

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
}

usersController.signIn = async (req, res, next)=>{
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
}

usersController.updateUser = async (req, res, next)=>{
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
        let updatedUser = await usersService.update(user);
        let userProfile = await userProfilesService.read(updatedUser._id)
        userProfile.email = updatedUser.email;
        userProfile.username = updatedUser.username;
        userProfile.phone = updatedUser.phone;

        userProfileUpdated = await userProfilesService.update(userProfile);
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
}

usersController.forgetPassword = async (req, res, next)=>{
  let email = req.body.email;

  try{
    let user = await usersService.readByEmail(email);
    if(!user){
      res.status(401).json({
        'info': 'User not found',
        'error': 'No user with the email'
      });
    } else{
      //generate and set reset password token and expiration
      user.generatePasswordReset();

      let resetUser = await usersService.update(user);

      let link = `http://${req.headers.host}/users/resetLink/${resetUser.resetPasswordToken}`;
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
}

usersController.resetPasswordLink = async (req, res, next)=>{
  let resetPasswordToken = req.params.resetPasswordToken;
  try{
    let user = await usersService.readByResetPasswordToken(resetPasswordToken, true); 
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
}

usersController.resetPassword = async (req, res, next)=>{
  let resetPasswordToken = req.params.resetPasswordToken;
  try{
    let user = await usersService.readByResetPasswordToken(resetPasswordToken, false);
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

        resettedUser = await usersService.update(user);

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
}

usersController.getProfile = async (req, res, next)=>{
  try{
    let email = req.login.email
    let userDetails = await usersService.getFullUserDetails(email);

    res.status(200).json({
      'info': 'Authorised user to get user details',
      'user': userDetails
    });
  } catch(err){
    res.status(500).json({
      'info': 'Internal server error to find userprofile',
      'error': err
    });
  }
}

module.exports = usersController;