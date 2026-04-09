import NextAuth from "next-auth";
import Naver from "next-auth/providers/naver";
import { prisma } from "./lib/prisma";

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
                //1. 로그인 후 토큰 갱신 -> DB에서 유저 정보 재조회
                const user = await prisma.users.findFirst({
                    where: {naver_id: String(token.naverId)},
                });

                if(user) {
                    token.name = user.name ?? "";
                    token.isNewUser = false;
                };
            }; 

            //2. 최초 로그인 시 profile이 있을 때 -> 네이버 프로필로 DB에서 유저 조회
            if (profile) {
                const naverId = (profile as any).response.id;
                token.naverId = naverId;

                const user = await prisma.users.findFirst({     //findUniqe는 uniqe키 걸려 있어야 가능함
                    where: { naver_id: naverId },
                })

                if(user) {
                    token.name = user.name ?? "";
                    token.isNewUser = false;
                } else {
                    token.isNewUser = true;
                }
            }

            //3. 세션 업데이트 시 최신 유저 정보 반영
            if(trigger ==="update" && token.naverId) {
                const user = await prisma.users.findFirst({
                    where: { naver_id: String(token.naverId)},
                });
               
                if(user){
                    token.name = user.name ?? "";
                    token.isNewUser = false;
                }
            }
            return token;
        }
    }
})

export const { GET, POST } = handlers;