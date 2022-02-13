import { Connection, createConnection } from 'typeorm';
import { ShitRegister } from './entities/ShitRegister';

export async function getConnection(): Promise<Connection> {
  if (
    typeof process.env.MYSQL_HOST === 'undefined' ||
    typeof process.env.MYSQL_PORT === 'undefined' ||
    typeof process.env.MYSQL_DATABASE === 'undefined' ||
    typeof process.env.MYSQL_PASSWORD === 'undefined' ||
    typeof process.env.MYSQL_USERNAME === 'undefined'
  ) {
    throw new Error('MYSQL_HOST and MYSQL_PORT environment variables are mandatory');
  }
  return await createConnection({
    type: 'mysql',
    host: process.env.MYSQL_HOST,
    port: +process.env.MYSQL_PORT,
    username: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    entities: [ShitRegister],
    synchronize: true,
  });
}
