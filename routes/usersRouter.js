var express = require('express');
var router = express.Router();

let usersController = require('../controllers/usersController');
let lib = require('./../lib/authenticate')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* GET users listing. */
router.post('/signup', usersController.signUp);

/* GET users listing. */
router.post('/signin', usersController.signIn);

router.put('/update', lib.authenticate, usersController.updateUser);

//Forget password section
router.post('/forgetPassword', usersController.forgetPassword);

router.get('/resetPasswordLink/:resetPasswordToken', usersController.resetPasswordLink);

router.post('/resetPassword/:resetPasswordToken', usersController.resetPassword)
/* GET user details. */
router.get('/profile', lib.authenticate, usersController.getProfile);


module.exports = router;
