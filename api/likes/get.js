import { query } from '../../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.body;

  try {
    const likes = await query(
      'SELECT COUNT(*) FROM article_ratings WHERE article_id = $1 AND value = true',
      [id]
    );

    const dislikes = await query(
      'SELECT COUNT(*) FROM article_ratings WHERE article_id = $1 AND value = false',
      [id]
    );

    res.status(200).json({
      likes: parseInt(likes.rows[0].count),
      dislikes: parseInt(dislikes.rows[0].count),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
