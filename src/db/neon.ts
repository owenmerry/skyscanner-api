import { neon } from '@neondatabase/serverless';

export const sql = (databaseUrl: string) => neon(databaseUrl);
