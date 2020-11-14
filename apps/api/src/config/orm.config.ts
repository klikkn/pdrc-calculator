import { ConnectionOptions } from 'typeorm';

const config = {
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: Number(process.env.DB_PORT) || 5432,
};

export default {
  type: 'postgres',
  host: config.host,
  port: config.port,
  username: config.username,
  password: config.password,
  database: config.database,
  synchronize: true, // TODO: will be changed on prod!,
  cli: {
    migrationsDir: 'src/db/migration',
    entitiesDir: 'src/db/entities',
    subscribersDir: 'src/db/subscriber',
  },
  migrations: ['dist/db/migration/*.js'],
  entities: ['dist/**/**.entity.js'],
  autoLoadEntities: true,
} as ConnectionOptions;
