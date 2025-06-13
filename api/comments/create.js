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

  const { articleId, body, parentId } = req.body;
  const userId = session.user.id;

  try {
    const article = await query('SELECT * FROM articles WHERE id = $1', [articleId]);
    if (article.rows.length === 0) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Если комментарий является ответом на другой комментарий, проверяем существование родительского комментария
    if (parentId) {
      const parentComment = await query('SELECT * FROM comments WHERE id = $1 AND article_id = $2', [parentId, articleId]);
      if (parentComment.rows.length === 0) {
        return res.status(404).json({ message: 'Parent comment not found or does not belong to the article' });
      }
    }

    const newComment = await query(
      'INSERT INTO comments (article_id, user_id, body, parent_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [articleId, userId, body, parentId]
    );

    res.status(201).json(newComment.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
