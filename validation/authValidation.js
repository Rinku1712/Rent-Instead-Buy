const Joi = require('joi');

const signupSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).required(),

  email: Joi.string().trim().email().lowercase().required(),

  password: Joi.string().min(8).max(128).required(),

  phone: Joi.string().trim().required(),

  address: Joi.object({
    houseNumber: Joi.string().trim().allow(''),
    street: Joi.string().trim().allow(''),
    area: Joi.string().trim().allow(''),
    landmark: Joi.string().trim().allow(''),
    city: Joi.string().trim().allow(''),
    district: Joi.string().trim().allow(''),
    state: Joi.string().trim().allow(''),
    country: Joi.string().trim().default('India'),
    postalCode: Joi.string().trim().allow(''),
  }).default({}),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email().lowercase().required(),
  password: Joi.string().required(),
});

module.exports = {
  signupSchema,
  loginSchema,
};
