import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../../lib/db';

interface Article {
  id: number;
  title: string;
  content: string;
  author_id: number;
  created_at?: Date;
}

export default async function handler(req: NextApiRequest,
 res: NextApiResponse<Article[] | { message: string } | { error: string }>) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const result = await query<Article>('SELECT * FROM articles ORDER BY created_at DESC');
    res.status(200).json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}