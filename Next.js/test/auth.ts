import NextAuth from "next-auth";
import Naver from "next-auth/providers/naver";
import { prisma } from "./lib/prisma";
import { linkAccountByEmail } from "./lib/accountLinker";

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Naver({
            clientId: process.env.NAVER_CLIENT_ID!,
            clientSecret: process.env.NAVER_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            if (session.user) {
                session.user.name = token.name ?? "";
                session.user.email = token.email ?? session.user.email;
                session.user.naverid = token.naverId;
                session.user.isNewUser = token.isNewUser;
                session.user.needsLinking = token.needsLinking;
                session.user.userId = token.userId;
                session.user.role = token.role;
            }
            return session;
        },

        async jwt({ token, profile, trigger, account }) {
            try {
                if (profile && account) {
                    console.log("[JWT] 네이버 프로필:", profile);
                    
                    const naverId = (profile as any).response?.id;
                    const email = (profile as any).response?.email;
                    
                    if (!naverId) {
                        console.error("[JWT] 네이버 ID를 찾을 수 없습니다");
                        return token;
                    }
                    
                    token.naverId = naverId;

                    const user = await prisma.users.findFirst({
                        where: { naver_id: naverId },
                    });

                    if (user) {
                        token.name = user.name ?? "";
                        token.userId = user.id;
                        token.email = user.email ?? "";
                        token.role = user.ROLE ?? "";
                        token.isNewUser = false;
                        token.needsLinking = false;
                    } else {
                        if (email) {
                            const linkResult = await linkAccountByEmail(naverId, email);
                            
                            if (linkResult.success && linkResult.user) {
                                token.name = linkResult.user.name ?? "";
                                token.userId = linkResult.user.id;
                                token.email = linkResult.user.email ?? "";
                                token.role = linkResult.user.ROLE ?? "";
                                token.isNewUser = false;
                                token.needsLinking = false;
                            } else {
                                token.isNewUser = true;
                                token.needsLinking = true;
                            }
                        } else {
                            token.isNewUser = true;
                            token.needsLinking = true;
                        }
                    }
                }

                if (trigger === "update" && token.naverId) {
                    const user = await prisma.users.findFirst({
                        where: { naver_id: String(token.naverId) },
                    });
                   
                    if (user) {
                        token.name = user.name ?? "";
                        token.userId = user.id;
                        token.email = user.email ?? "";
                        token.role = user.ROLE ?? "";
                        token.isNewUser = false;
                    }
                }
            } catch (error) {
                console.error("[JWT ERROR]", error);
            }
            
            return token;
        }
    }
});