import { query } from '../../../lib/db';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id } = req.body;
  const userId = session.user.id;

  try {
    const checkAuthor = await query(
      'SELECT author_id FROM articles WHERE id = $1',
      [id]
    );

    if (checkAuthor.rows.length === 0) {
      return res.status(404).json({ message: 'Article not found' });
    }

    if (checkAuthor.rows[0].author_id !== userId) {
      return res.status(403).json({ message: 'Forbidden: You are not the author of this article' });
    }

    await query('DELETE FROM articles WHERE id = $1', [id]);

    res.status(200).json({ message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}