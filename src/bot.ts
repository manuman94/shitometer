import {Context, Telegraf} from 'telegraf';
import {Connection, Repository} from 'typeorm';
import {ShitRegister} from './entities/ShitRegister';

/**
 * A telegram bot to share shit statistics between friends.
 */
export class ShitometerBot {
  private bot: Telegraf;

  /**
   * ShitometerBot constructor
   * @param {Connection} connection Typeorm connection to work with
   */
  constructor(private connection: Connection) {
    if (typeof process.env.BOT_TOKEN === 'undefined') {
      const err = `Use BOT_TOKEN environment 
        variable with the token provided by Botfather.`;
      throw new Error(err);
    }
    this.connection = connection;
    this.bot = new Telegraf(process.env.BOT_TOKEN);
    this.setupCommands();
    this.setupOnDestroy();
    this.launch();
  }

  /**
   * Setup bot commands
   */
  private setupCommands() {
    const self: ShitometerBot = this;
    this.bot.command(['cagado', 'caca', 'shit'], async (ctx) => {
      await this.shitCommand.call(self, ctx);
    });

    this.bot.command(['me', 'yo'], async (ctx) => {
      await this.meCommand.call(self, ctx);
    });
  }

  /**
   * Enable bot gracefully stop
   */
  private setupOnDestroy() {
    process.once('SIGINT', () => this.bot.stop('SIGINT'));
    process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
  }

  /**
   * Launch the bot and start listening for messages
   */
  private launch() {
    this.bot.launch();
    console.log('Shitometer Bot launched');
  }

  /**
   * The shit command action
   * @param {Context} ctx Telegram message context
   */
  private async shitCommand(ctx: Context) {
    await this.addShitRegister(ctx);
    ctx.reply('Shit register stored 💩');
  }

  /**
   * The me command action
   * @param {Context} ctx Telegram message context
   */
  private async meCommand(ctx: Context) {
    ctx.reply('Your last week stats:');
  }

  /**
   * Get the TypeORM repository to use persistence layer
   * @return {Repository<ShitRegister>} The ShitRegister repository
   */
  private getRepository(): Repository<ShitRegister> {
    return this.connection.getRepository(ShitRegister);
  }

  /**
   * Add shit register to persistence layer
   * @param {Context} ctx Telegram message context
   */
  private async addShitRegister(ctx: Context) {
    try {
      const ShitRegisterRepository = this.getRepository();
      if (typeof ctx.from === 'undefined' ||
          typeof ctx.from.id === 'undefined') {
        throw new Error('Sender ID is undefined');
      }
      let username = ctx.from.username;
      if ( typeof ctx.from.username === 'undefined' ) {
        username = ctx.from.first_name;
        if ( typeof ctx.from.last_name !== 'undefined' ) {
          username += ' ' + ctx.from.last_name;
        }
      }
      if (typeof ctx.chat === 'undefined' ||
          typeof ctx.chat.id === 'undefined') {
        throw new Error('Chat ID is undefined');
      }
      await ShitRegisterRepository.save({
        user: ctx.from.id + '',
        username: username + '',
        chat: ctx.chat.id + '',
        createdAt: new Date(),
      });
    } catch (err) {
      throw new Error(err + '');
    }
  }
}
