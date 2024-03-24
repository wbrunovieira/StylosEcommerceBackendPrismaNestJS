import 'dotenv/config';

import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { execSync } from 'node:child_process';
import { spawnSync } from 'child_process';

const prisma = new PrismaClient();

function generateUniqueDatabaseURL(schemaId: string) {
  if (!process.env.DATABASE_URL) {
    throw new Error('Please provider a DATABASE_URL environment variable');
  }

  const url = new URL(process.env.DATABASE_URL);

  url.searchParams.set('schema', schemaId);
  console.log(`Schema ID: ${schemaId}`);
  console.log(`Database URL: ${process.env.DATABASE_URL}`);

  return url.toString();
}

const schemaId = randomUUID();

beforeAll(async () => {
  const databaseURL = generateUniqueDatabaseURL(schemaId);

  process.env.DATABASE_URL = databaseURL;

  const result = spawnSync('npx', ['prisma', 'migrate', 'deploy'], {
    stdio: 'pipe',
    env: process.env,
  });

  const { stdout, stderr } = result;
  console.log(stdout?.toString());
  console.error(stderr?.toString());
});

afterAll(async () => {
  try {
    await prisma.$executeRawUnsafe(
      `DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`
    );
  } catch (error) {
    console.error('Error dropping schema:', error);
  }
  await prisma.$disconnect();
});
