import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';
import { query } from '../../../lib/db';

export default NextAuth({
  providers: [
    Providers.Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        const user = await query('SELECT * FROM users WHERE email = $1 AND password = $2', [
          credentials.email,
          credentials.password
        ]);

        if (user.rows.length > 0) {
          return { id: user.rows[0].id, email: user.rows[0].email, name: user.rows[0].name };
        } else {
          return null;
        }
      }
    })
  ],
  session: {
    jwt: true,
  },
  callbacks: {
    async session(session, user) {
      session.user = user;
      return session;
    },
    async jwt(token, user) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
});
