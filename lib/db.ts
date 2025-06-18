import { Pool, PoolConfig, QueryResult } from 'pg';

interface DatabaseConfig extends PoolConfig {
  user: string;
  host: string;
  database: string;
  password: string;
  port: number;
  ssl?: boolean | { rejectUnauthorized: boolean };
}

const dbConfig: DatabaseConfig = {
  user: 'web_project_uhul_user',
  host: 'dpg-d15v2dumcj7s73dr7iug-a.oregon-postgres.render.com',
  database: 'web_project_uhul',
  password: 'HiNbKkwdF0YZ2qQkkqNOmkUPipkh74FY',
  port: 5432,
  ssl: {
      rejectUnauthorized: true
  }
};

const pool = new Pool(dbConfig);

export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query<T>(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    if (client) client.release();
  }
}

pool.query('SELECT NOW()')
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.error('Database connection error', err));

export default pool;