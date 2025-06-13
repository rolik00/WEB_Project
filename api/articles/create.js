import { query } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { title, content, authorId } = req.body;

  try {
    const result = await query(
      'INSERT INTO articles (title, content, author_id) VALUES ($1, $2, $3) RETURNING *',
      [title, content, authorId]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}