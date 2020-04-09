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

validate.updateProductJsonFields = function(req){
  let schema = Joi.object({
    name: Joi.string().min(6),
    // imagePath: ['bg-10.jpg', 'bg-69.jpg', 'bg-84.jpg', 'image00008.jpg'],
    description: Joi.string().min(10),
    discountPercent: Joi.number(),
    availableQuantity: Joi.number(),
    price: Joi.number(),
    category: Joi.string().min(6),
    seller: Joi.string().min(6),
    reviews: Joi.array().items(Joi.object({
      name: Joi.string(),
      rating: Joi.number(),
      description: Joi.string()
    }).required()),
    isTrending: Joi.boolean(),
    isDiscounted: Joi.boolean(),
    offers: Joi.array().items(Joi.string()),
    sizes: Joi.array().items(Joi.string()),
    colors: Joi.array().items(Joi.string()),
    averageRating: Joi.number()
  })

  return schema.validate(req.body)
}

module.exports = validate;