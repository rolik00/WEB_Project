import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../../lib/db';
import { getSession } from 'next-auth/react';

interface UserVoteRequest extends NextApiRequest {
  query: {
    articleId: string;
  };
}

export default async function handler(req: UserVoteRequest, res: NextApiResponse<{ value: boolean } | { message: string } | { error: string }>) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const articleId = parseInt(req.query.articleId);
  if (isNaN(articleId) || articleId <= 0) {
    return res.status(400).json({ message: 'Invalid article ID' });
  }

  try {
    const userVote = await query<{ value: boolean }>(
      'SELECT value FROM likes WHERE article_id = $1 AND user_id = $2',
      [articleId, session.user.id]
    );

    if (userVote.rows.length === 0) {
      return res.status(200).json({ value: null });
    }

    res.status(200).json({ value: userVote.rows[0].value });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
