import { Pool } from 'pg';

const pool = new Pool({
  user: 'web_project_uhul_user',
  host: 'dpg-d15v2dumcj7s73dr7iug-a.oregon-postgres.render.com',
  database: 'web_project_uhul',
  password: 'HiNbKkwdF0YZ2qQkkqNOmkUPipkh74FY',
  port: 5432,
});

export default pool;