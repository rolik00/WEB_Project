import { query } from '../../../lib/db';
import { getSession } from 'next-auth/react';

const COMMENT_WAS_DELETED = "Комментарий был удален";

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id, body } = req.body;
  const userId = session.user.id;

  try {
    const comment = await query('SELECT * FROM comments WHERE id = $1 AND user_id = $2', [id, userId]);
    if (comment.rows.length === 0) {
      return res.status(404).json({ message: 'Comment not found or user is not the author' });
    }

    if (comment.rows[0].body === COMMENT_WAS_DELETED) {
          return res.status(400).json({ message: 'Cannot update a comment that has been deleted' });
    }

    const updatedComment = await query(
      'UPDATE comments SET body = $1 WHERE id = $2 RETURNING *',
      [body, id]
    );

    res.status(200).json(updatedComment.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
