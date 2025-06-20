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

export default async function handler(req: NextApiRequest,
 res: NextApiResponse<Article[] | { message: string } | { error: string }>) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const result = await query<Article>(`SELECT a.id, a.title, a.content, a.author_id, u.name as author_name, a.created_at 
      FROM articles a JOIN users u ON a.author_id = u.id ORDER BY a.created_at DESC`);
    res.status(200).json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
