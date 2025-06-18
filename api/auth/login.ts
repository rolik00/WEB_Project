import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { query } from '../../../lib/db';

interface User {
  id: number;
  email: string;
  name: string;
  password: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        if (!credentials) return null;
        
        const user = await query<User>(
          'SELECT * FROM users WHERE email = $1 AND password = $2', 
          [credentials.email, credentials.password]
        );

        if (user.rows.length > 0) {
          return { 
            id: user.rows[0].id.toString(), 
            email: user.rows[0].email, 
            name: user.rows[0].name 
          };
        }
        return null;
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub || '';
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);