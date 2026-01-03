import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  await client.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
  await client.end();
  console.log('Database reset successfully');
}
main();