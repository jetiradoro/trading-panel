const config = {
  app: {
    port: process.env.API_PORT || 3000,

    token: process.env.TOKEN || '',
    env: process.env.DOCKER_ENVIRONMENT || 'development',
  },
  db: {
    dbUrl: process.env.DATABASE_URL,
  },
};

export default () => config;
