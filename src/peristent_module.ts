import { Connection, createConnection } from 'typeorm';
import { ShitRegister } from './entities/ShitRegister';
import { TimeFilter } from './models/TimeFilter';

/**
 * Get persistence layer connection by TypeORM
 * @return {Connection} Typeorm.Connection
 */
export default async function getConnection(): Promise<Connection> {
  if (
    typeof process.env.MYSQL_HOST === 'undefined' ||
    typeof process.env.MYSQL_PORT === 'undefined' ||
    typeof process.env.MYSQL_DATABASE === 'undefined' ||
    typeof process.env.MYSQL_PASSWORD === 'undefined' ||
    typeof process.env.MYSQL_USERNAME === 'undefined'
  ) {
    const err = `MYSQL_HOST, MYSQL_PORT, MYSQL_DATABASE, 
      MYSQL_PASSWORD and MYSQL_USERNAME environment variables are mandatory`;
    throw new Error(err);
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

/**
 * Get the top shitters of the specified date interval and chat
 * @param {TimeFilter} timeFilter Time filter
 * @param {string} chat Chat to get the top shitters from
 */
export async function getTopShitters(timeFilter: TimeFilter, chat: string) {
  const connection: Connection = await getConnection();
  const queryBuilder =
    connection.getRepository(ShitRegister).createQueryBuilder();
  return await queryBuilder.addSelect('count(*)', 'count')
      .where('chat = :chat', { chat: chat })
      .andWhere(`createdAt between date_sub(now(), ` +
        `INTERVAL 1 ${timeFilter.toString()}) and now()`)
      .groupBy('user')
      .orderBy('count', 'DESC');
}
