import * as dotenv from 'dotenv';

dotenv.config();

const config = {
  cors_origin: process.env.CORS_ORIGIN,

  app: {
    port: process.env.API_PORT || 3000,
    env: process.env.DOCKER_ENVIRONMENT || 'development',
    jwt: {
      secret: process.env.JWT_SECRET,
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
      subscribe: process.env.JWT_SUBSCRIBE,
      clockTolerance: process.env.JWT_CLOCK_TOLERANCE
        ? parseInt(process.env.JWT_CLOCK_TOLERANCE)
        : 5, //seconds
      expiration: process.env.JWT_EXPIRATION
        ? parseInt(process.env.JWT_EXPIRATION)
        : 3600, //seconds
    },
  },
  db: {
    dbUrl: process.env.DATABASE_URL,
  },
};

export default () => config;
