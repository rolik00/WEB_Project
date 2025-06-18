import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../../lib/db';
import { getSession } from 'next-auth/react';

const COMMENT_WAS_DELETED = "Комментарий был удален";

interface DeleteCommentRequest extends NextApiRequest {
  body: {
    id: number;
  };
}

interface Comment {
  id: number;
  article_id: number;
  user_id: number;
  body: string;
  created_at?: Date;
  parent_id?: number | null;
}

export default async function handler(req: DeleteCommentRequest, res: NextApiResponse<{ message: string } | { error: string }>) {
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
    const comment = await query<Comment>('SELECT * FROM comments WHERE id = $1 AND user_id = $2', [id, userId]);
    if (comment.rows.length === 0) {
      return res.status(404).json({ message: 'Comment not found or user is not the author' });
    }

    if (comment.rows[0].body === COMMENT_WAS_DELETED) {
              return res.status(400).json({ message: 'Cannot delete a comment that has been deleted' });
    }

    const childrenComments = await query<{ count: string }>('SELECT COUNT(*) FROM comments WHERE parent_id = $1', [id]);
    const childrenCount = parseInt(childrenComments.rows[0].count);

    if (childrenCount === 0) {
      await query('DELETE FROM comments WHERE id = $1', [id]);
    } else {
      await query('UPDATE comments SET body = $1 WHERE id = $2', [COMMENT_WAS_DELETED, id]);
    }

    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
