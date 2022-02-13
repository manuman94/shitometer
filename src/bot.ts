import { Context, Telegraf } from 'telegraf';
import { Connection, Repository } from 'typeorm';
import { ShitRegister } from './entities/ShitRegister';

export class ShitometerBot {
  private bot: Telegraf;

  constructor(private connection: Connection) {
    if (typeof process.env.BOT_TOKEN === 'undefined') {
      throw new Error('Use BOT_TOKEN environment variable with the token provided by Botfather.');
    }
    this.connection = connection;
    this.bot = new Telegraf(process.env.BOT_TOKEN);
    this.setupCommands();
    this.setupOnDestroy();
    this.launch();
  }

  private setupCommands() {
    const self: ShitometerBot = this;
    this.bot.command(['cagado', 'caca', 'shit'], async (ctx) => {
        await this.startCommand.call(self, ctx);
    });

    
    this.bot.command(['me', 'yo'], async (ctx) => {
      await this.meCommand.call(self, ctx);
  });
  }

  private setupOnDestroy() {
    process.once('SIGINT', () => this.bot.stop('SIGINT'));
    process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
  }

  private launch() {
    this.bot.launch();
  }

  private async startCommand(ctx: Context) {
    await this.addShitRegister(ctx);
    ctx.reply('Shit register stored 💩');
  }

  private async meCommand(ctx: Context) {
    ctx.reply('Your last week stats:');
  }

  private getRepository(): Repository<ShitRegister> {
    return this.connection.getRepository(ShitRegister);
  }

  private async addShitRegister(ctx: Context) {
    try {
      const ShitRegisterRepository = this.getRepository();
      if ( typeof ctx.from === 'undefined' ||  typeof ctx.from.id === 'undefined' ) {
        throw new Error('Sender ID is undefined');
      }
      await ShitRegisterRepository.save({
        user: ctx.from.id + '',
        createdAt: new Date()
      });
    } catch (err) {
      throw new Error(err + '');
    }
  }
}
