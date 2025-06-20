import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../../../lib/db';

interface Comment {
  id: number;
  article_id: number;
  user_id: number;
  author_name: string;
  body: string;
  created_at?: Date;
  parent_id?: number | null;
}

interface GetCommentsRequest extends NextApiRequest {
  query: {
    id: string;
  };
}

export default async function handler(req: GetCommentsRequest, res: NextApiResponse<Comment[] | { message: string } | { error: string }>) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const id = parseInt(req.query.id);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ message: 'Invalid article ID' });
  }

  try {
    const comments = await query<Comment>(`SELECT c.id, c.article_id,c.user_id, u.name as user_name, c.body, c.created_at, c.parent_id FROM comments c
      JOIN users u ON c.user_id = u.id WHERE c.article_id = $1 ORDER BY c.created_at ASC`, [id]);
    res.status(200).json(comments.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
