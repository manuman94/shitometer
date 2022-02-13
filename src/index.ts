import { config } from 'dotenv';
import { Connection } from 'typeorm';
import { ShitometerBot } from './bot';
import { getConnection } from './peristent_module';

const start = async () => {
  configEnvVars();
  const connection: Connection = await getConnection();
  const shitometerBot = new ShitometerBot(connection);
};

const configEnvVars = () => {
  config();
};

start();
