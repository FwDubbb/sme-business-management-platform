import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dbPromise = null;

async function openConnection() {
  const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/business.db');
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });
  await db.exec('PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');
  return db;
}

export function getDb() {
  if (!dbPromise) {
    dbPromise = openConnection().catch(error => {
      dbPromise = null;
      throw error;
    });
  }
  return dbPromise;
}

// A separate connection keeps unrelated requests out of this transaction.
// BEGIN IMMEDIATE serializes writers before they check stock or debt balances.
export async function withTransaction(callback) {
  const db = await openConnection();
  let started = false;
  try {
    await db.exec('BEGIN IMMEDIATE');
    started = true;
    const result = await callback(db);
    await db.exec('COMMIT');
    return result;
  } catch (error) {
    if (started) await db.exec('ROLLBACK');
    throw error;
  } finally {
    await db.close();
  }
}

export async function closeDb() {
  if (dbPromise) {
    const db = await dbPromise;
    await db.close();
    dbPromise = null;
  }
}
