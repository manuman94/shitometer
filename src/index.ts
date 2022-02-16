import {config as configEnvVars} from 'dotenv';
import {Connection} from 'typeorm';
import {ShitometerBot} from './bot';
import getConnection from './peristent_module';

const start = async () => {
  configEnvVars();
  const connection: Connection = await getConnection();
  try {
    new ShitometerBot(connection);
  } catch (err) {
    console.error(err);
  }
};

start();
