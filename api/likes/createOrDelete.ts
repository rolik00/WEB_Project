import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../../lib/db';
import { getSession } from 'next-auth/react';

interface LikeRequest extends NextApiRequest {
  body: {
    articleId: number;
    value: boolean;
  };
}

interface Like {
  id: number,
  article_id: number;
  user_id: number;
  value: boolean;
}

export default async function handler(req: LikeRequest, res: NextApiResponse<{ message: string } | { error: string }>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { articleId, value } = req.body;
  const userId = session.user.id;

  try {
    const existingLike = await query<Like>(
      'SELECT * FROM likes WHERE article_id = $1 AND user_id = $2',
      [articleId, userId]
    );

    if (existingLike.rows.length > 0) {
      if (existingLike.rows[0].value === value) {
        await query(
          'DELETE FROM likes WHERE article_id = $1 AND user_id = $2',
          [articleId, userId]
        );
        return res.status(200).json({ message: 'Like/dislike removed' });
      } else {
        await query(
          'UPDATE likes SET value = $1 WHERE article_id = $2 AND user_id = $3',
          [value, articleId, userId]
        );
        return res.status(200).json({ message: 'Like/dislike updated' });
      }
    } else {
      await query(
        'INSERT INTO likes (article_id, user_id, value) VALUES ($1, $2, $3)',
        [articleId, userId, value]
      );
      return res.status(201).json({ message: 'Like/dislike added' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
