import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../../lib/db';
import { hash } from 'bcryptjs';

interface RegisterRequest extends NextApiRequest {
  body: {
    name: string;
    email: string;
    password: string;
  };
}

interface User {
  id: number;
  name: string;
  email: string;
}

export default async function handler(req: RegisterRequest, res: NextApiResponse<User | { message: string } | { error: string }>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, email, password } = req.body;

  try {
    const existingUser = await query<User>('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await hash(password, 12);

    const newUser = await query<User>(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashedPassword]
    );

    res.status(201).json(newUser.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}