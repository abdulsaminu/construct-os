import pg from 'pg';
export function getPool(): pg.Pool { throw new Error("DB not configured"); }
export async function withTransaction<T>(fn: (client: pg.PoolClient) => Promise<T>): Promise<T> { throw new Error("DB not configured"); }
