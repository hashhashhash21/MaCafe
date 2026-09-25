import { env } from 'cloudflare:workers';

export function cfEnv() {
  return env as unknown as Cloudflare.Env;
}

export function db(): D1Database {
  const database = cfEnv().DB;
  if (!database) throw new Error('D1 binding DB is not configured');
  return database;
}

export function secret(name: keyof Cloudflare.Env): string {
  const value = cfEnv()[name];
  return typeof value === 'string' ? value : '';
}
