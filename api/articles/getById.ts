import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../../lib/db';

interface Article {
  id: number;
  title: string;
  content: string;
  author_id: number;
  author_name: string;
  created_at?: Date;
}

interface GetByIdRequest extends NextApiRequest {
  query: {
    id: string;
  };
}

export default async function handler(req: GetByIdRequest, res: NextApiResponse<Article | { message: string } | { error: string }>) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const id = parseInt(req.query.id);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ message: 'Invalid article ID' });
  }

  try {
    const result = await query<Article>(`SELECT a.id, a.title, a.content, a.author_id, u.name as author_name, a.created_at 
      FROM articles a JOIN users u ON a.author_id = u.id WHERE a.id = $1`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Article not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
