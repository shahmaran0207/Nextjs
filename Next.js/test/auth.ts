import NextAuth from "next-auth";
import Naver from "next-auth/providers/naver";
import { getConnection } from "./util/database";
import oracledb from "oracledb";

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Naver({
            clientId: process.env.NAVER_CLIENT_ID!,
            clientSecret: process.env.NAVER_CLIENT_SECRET!,
        }),
    ],

    callbacks: {
        async session({ session, token }) {
            session.user.name = token.name ?? "";
            (session.user as any).naverid = token.naverId;
            (session.user as any).isNewUser = token.isNewUser;
            return session;
        },
        async jwt({ token, profile, trigger }) {
            if (!profile && trigger !== "update" && token.isNewUser && token.naverId) {
                const conn = await getConnection();
                const result = await conn.execute(
                    `SELECT * FROM TEST.USERS WHERE NAVER_ID =:naverId`,
                    { naverId: token.naverId },
                    { outFormat: oracledb.OUT_FORMAT_OBJECT }
                );

                await conn.close();
                const user = (result.rows as any[])[0];

                if(user) {
                    token.name = user.NAME;
                    token.isNewUser = false;
                };
            };

            if (profile) {
                const naverId = (profile as any).response.id;
                token.naverId = naverId;

                const conn = await getConnection();
                const result = await conn.execute(
                    `SELECT * FROM TEST.USERS WHERE NAVER_ID =:naverId`,
                    { naverId },
                    { outFormat: oracledb.OUT_FORMAT_OBJECT }
                );

                await conn.close();
                const user = (result.rows as any[])[0];
                if(user) {
                    token.name = user.NAME;
                    token.isNewUser = false;
                } else {
                    token.isNewUser = true;
                }
            }

            if(trigger ==="update" && token.naverId) {
                const conn = await getConnection();
                const result = await conn.execute(
                    `SELECT * FROM TEST.USERS WHERE NAVER_ID = :naverId`, 
                    { naverId: token.naverId },
                    { outFormat: oracledb.OUT_FORMAT_OBJECT }
                );

                await conn.close();
                const user = (result.rows as any[])[0];
                if(user){
                    token.name = user.NAME;
                    token.isNewUser = false;
                }
            }
            return token;
        }
    }
})

export const { GET, POST } = handlers;