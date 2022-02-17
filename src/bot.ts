import { Context, Markup, Telegraf } from 'telegraf';
import { User } from 'telegraf/typings/core/types/typegram';
import { Connection, Repository } from 'typeorm';
import { ShitRegister } from './entities/ShitRegister';
import { DBHelper } from './helpers/DBHelper';
import { TimeFilter } from './models/TimeFilter';

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

    this.bot.command(['top'], async (ctx) => {
      await this.topCommand.call(self, ctx);
    });

    this.bot.action('DAILY_TOP', async (ctx) => {
      await this.showTopCommand.call(self, ctx, TimeFilter.DAY);
    });

    this.bot.action('WEEKLY_TOP', async (ctx) => {
      await this.showTopCommand.call(self, ctx, TimeFilter.WEEK);
    });

    this.bot.action('MONTHLY_TOP', async (ctx) => {
      await this.showTopCommand.call(self, ctx, TimeFilter.MONTH);
    });

    this.bot.action('YEARLY_TOP', async (ctx) => {
      await this.showTopCommand.call(self, ctx, TimeFilter.YEAR);
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
   * The top command action
   * @param {Context} ctx Telegram message context
   */
  private async topCommand(ctx: Context) {
    ctx.replyWithMarkdownV2('Which TOP do you want to see?',
        Markup.inlineKeyboard([
          Markup.button.callback('Daily top', 'DAILY_TOP'),
          Markup.button.callback('Weekly top', 'WEEKLY_TOP'),
          Markup.button.callback('Monthly top', 'MONTHLY_TOP'),
          Markup.button.callback('Yearly top', 'YEARLY_TOP'),
        ]));
  }

  /**
   * The top command action
   * @param {Context} ctx Telegram message context
   * @param {TimeFilter} timeFilter Time filter
   */
  private async showTopCommand(ctx: Context, timeFilter: TimeFilter) {
    try {
      if ( typeof ctx.chat?.id === 'undefined' ||
           typeof ctx.chat === 'undefined' ) {
        throw new Error('Chat ID Not found');
      }
      const shitters = await DBHelper.getTopShitters(
          this.connection,
          timeFilter,
          ctx.chat.id + '',
      );

      ctx.reply(this.getMarkdownTop(shitters, timeFilter));
    } catch (err) {
      console.log(err);
    }
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
      if (typeof ctx.chat === 'undefined' ||
          typeof ctx.chat.id === 'undefined') {
        throw new Error('Chat ID is undefined');
      }
      await ShitRegisterRepository.save({
        user: ctx.from.id + '',
        username: this.getUserName(ctx.from),
        chat: ctx.chat.id + '',
        createdAt: new Date(),
      });
    } catch (err) {
      throw new Error(err + '');
    }
  }

  /**
   * Get username from user.
   * If username is not present first_name and last_name will be used
   * @param {User} user User to get the name from
   * @return {string} The proper username value
   */
  private getUserName(user: User): string {
    let username = user.username;
    if ( typeof user.username === 'undefined' ) {
      username = user.first_name;
      if ( typeof user.last_name !== 'undefined' ) {
        username += ' ' + user.last_name;
      }
    }
    return username + '';
  }

  /**
   * Get a beautiful markdown of the TOP shitters
   * @param {ShitRegister[]} shitRegisters Top shitter registers
   * @param {TimeFilter} timeFilter Time filter used for the TOP
   * @return {string} A beautiful markdown of the TOP shitters
   */
  private getMarkdownTop(
      shitRegisters: any[],
      timeFilter: TimeFilter,
  ): string {
    let output = `🏆 TOP OF THE ${TimeFilter[timeFilter]} 🏆 \n`;
    let i = 0;
    for ( const shitRegister of shitRegisters ) {
      i++;
      output += `${this.numberEmojis[i]}` +
        ` ${shitRegister.username}:` +
        ` ${shitRegister.count} \n`;
    }
    return output;
  }

  /**
   * Sanitize markdown output to avoid message errors
   * @param {string} output The output to sanitize
   * @return {string} Sanitized output
   */
  private sanitizeMarkdownOutput(output: string): string {
    return output.replace('_', '\\_')
        .replace('*', '\\*')
        .replace('[', '\\[')
        .replace('`', '\\`');
  }

  private numberEmojis = ['0', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];
}
