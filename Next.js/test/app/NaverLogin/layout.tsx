import NextAuthProvider from "@/component/SocialLogin"

export default function Layout({
    children,
}:{
    children: React.ReactNode
}) {
    return (
        <html lang="ko">
            <body>
                <NextAuthProvider>{children}</NextAuthProvider>
            </body>
        </html>
    )
}