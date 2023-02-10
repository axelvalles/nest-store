import * as Joi from 'joi';

export const enviroments = {
  dev: '.env.development',
  stag: '.env.staging',
  prod: '.env.production',
};


export const enviromentSchema = Joi.object({
  API_KEY: Joi.string().required(),
  PORT: Joi.number().required(),
  JWT_SECRET: Joi.string().required(),
  // database
  POSTGRES_DB: Joi.string().required(),
  POSTGRES_USER: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),
  POSTGRES_PORT: Joi.number().required(),
  POSTGRES_HOST: Joi.string().required(),
})
