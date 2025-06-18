import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../../../lib/db';

interface LikesResponse {
  likes: number;
  dislikes: number;
}

interface GetLikesRequest extends NextApiRequest {
  query: {
    id: string;
  };
}

export default async function handler(req: GetLikesRequest, res: NextApiResponse<LikesResponse | { message: string } | { error: string }>) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const id = parseInt(req.query.id);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ message: 'Invalid article ID' });
  }

  try {
    const likes = await query<{ count: string }>(
      'SELECT COUNT(*) FROM likes WHERE article_id = $1 AND value = true',
      [id]
    );

    const dislikes = await query<{ count: string }>(
      'SELECT COUNT(*) FROM likes WHERE article_id = $1 AND value = false',
      [id]
    );

    res.status(200).json({
      likes: parseInt(likes.rows[0].count),
      dislikes: parseInt(dislikes.rows[0].count),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
