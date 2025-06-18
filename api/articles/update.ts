import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../../lib/db';
import { getSession } from 'next-auth/react';

interface Article {
  id: number;
  title: string;
  content: string;
  author_id: number;
  created_at?: Date;
}

interface UpdateRequest extends NextApiRequest {
  body: {
    id: number;
    title: string;
    content: string;
  };
}

export default async function handler(req: UpdateRequest, res: NextApiResponse<Article | { message: string } | { error: string }>) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id, title, content } = req.body;
  const userId = session.user.id;

  try {
    const checkAuthor = await query<{ author_id: number }>(
      'SELECT author_id FROM articles WHERE id = $1',
      [id]
    );

    if (checkAuthor.rows.length === 0) {
      return res.status(404).json({ message: 'Article not found' });
    }

    if (checkAuthor.rows[0].author_id !== userId) {
      return res.status(403).json({ message: 'Forbidden: You are not the author of this article' });
    }

    const result = await query<Article>(
      'UPDATE articles SET title = $1, content = $2 WHERE id = $3 RETURNING *',
      [title, content, id]
    );

    res.status(200).json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}