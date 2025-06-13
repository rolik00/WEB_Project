import { query } from '../../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.body;

  try {
    const comments = await query('SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at ASC', [id]);
    res.status(200).json(comments.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
