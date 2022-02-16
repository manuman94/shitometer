import { Connection } from 'typeorm';
import { ShitRegister } from '../entities/ShitRegister';
import { TimeFilter } from '../models/TimeFilter';

/**
 * A class for making complex DB queries
 */
export class DBHelper {
  /**
   * Get the top shitters of the specified date interval and chat
   * @param {Connection} connection Persistence layer connection
   * @param {TimeFilter} timeFilter Time filter
   * @param {string} chat Chat to get the top shitters from
   */
  public static async getTopShitters(
      connection: Connection,
      timeFilter: TimeFilter,
      chat: string,
  ): Promise<any[]> {
    const queryBuilder =
        connection.getRepository(ShitRegister).createQueryBuilder();
    return await queryBuilder.addSelect('count(*)', 'count')
        .where('chat = :chat', { chat: chat })
        .andWhere(`createdAt between date_sub(now(), ` +
            `INTERVAL 1 ${TimeFilter[timeFilter]}) and now()`)
        .groupBy('user')
        .orderBy('count', 'DESC')
        .limit(5)
        .getRawMany();
  }
}
