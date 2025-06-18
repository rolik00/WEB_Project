import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../../lib/db';
import { getSession } from 'next-auth/react';

interface ArticleRequest extends NextApiRequest {
  body: {
    title: string;
    content: string;
  };
}

interface Article {
  id: number;
  title: string;
  content: string;
  author_id: number;
  created_at?: Date;
}

export default async function handler(req: ArticleRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { title, content } = req.body;
  const authorId = session.user.id;

  if (!title?.trim() || !content?.trim()) {
     return res.status(400).json({ message: 'Missing required fields' });
  }

  if (typeof title !== 'string' || title.length > 255 || title.length < 3) {
     return res.status(400).json({ message: 'Title must be 3-255 characters' });
  }

  if (typeof content !== 'string' || content.length > 10000 || content.length < 10) {
    return res.status(400).json({ message: 'Content must be 10-10000 characters' });
  }

  try {
    const result = await query<Article>(
      'INSERT INTO articles (title, content, author_id) VALUES ($1, $2, $3) RETURNING *',
      [title.trim(), content.trim(), authorId]
    );

    if (result.rows.length === 0) {
      return res.status(500).json({ message: 'Failed to create article' });
    }

    const newArticle = result.rows[0];
    return res.status(201).json(newArticle);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}