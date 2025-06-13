import { query } from '../../../lib/db';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
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
    const existingRating = await query(
      'SELECT * FROM article_ratings WHERE article_id = $1 AND user_id = $2',
      [articleId, userId]
    );

    if (existingRating.rows.length > 0) {
      if (existingRating.rows[0].value === value) {
        await query(
          'DELETE FROM article_ratings WHERE article_id = $1 AND user_id = $2',
          [articleId, userId]
        );
        return res.status(200).json({ message: 'Rating removed' });
      } else {
        await query(
          'UPDATE article_ratings SET value = $1 WHERE article_id = $2 AND user_id = $3',
          [value, articleId, userId]
        );
        return res.status(200).json({ message: 'Rating updated' });
      }
    } else {
      await query(
        'INSERT INTO article_ratings (article_id, user_id, value) VALUES ($1, $2, $3)',
        [articleId, userId, value]
      );
      return res.status(201).json({ message: 'Rating added' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
