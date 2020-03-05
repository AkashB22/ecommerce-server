let Joi = require('@hapi/joi');

let validate = {};

validate.signupValidation = function(req){
  let schema = Joi.object({
    email : Joi.string().required().min(6).email(),
    password : Joi.string().required().min(6),
    username : Joi.string().required().min(4),
    phone : Joi.string().required().min(10)  
  })
  return schema.validate(req.body);
}

validate.signinValidation = function(req){
  let schema = Joi.object({
    email : Joi.string().required().min(6).email().required(),
    password : Joi.string().required().min(6)
  })
  return schema.validate(req.body);
}

validate.updateValidation = function(req){
  let schema = Joi.object({
    email : Joi.string().min(6).email(),
    password : Joi.string().min(6),
    username : Joi.string().min(6),
    phone : Joi.string().min(10)  
  })
  return schema.validate(req.body);
}

validate.resetPasswordValidation = function(req){
  let schema = Joi.object({
    password : Joi.string().min(6).required(),
  })
  return schema.validate(req.body);
}


module.exports = validate;