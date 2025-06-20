import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../../lib/db';
import { compare } from 'bcryptjs';


interface User {
  id: number;
  email: string;
  name: string;
  password: string;
}

interface AuthRequest extends NextApiRequest {
  body: {
    email: string;
    password: string;
  };
}

export default async function handler(
  req: AuthRequest,
  res: NextApiResponse<{ message: string } | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).end(`Method not allowed`);
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const userResult = await query<User>('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];
    const passwordMatch = await compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    return res.status(200).json({ message: 'User authenticated successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}