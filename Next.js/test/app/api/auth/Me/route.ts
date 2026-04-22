import { verifyAccessToken } from "@/utils/auth";
import { cookies } from "next/headers";

export async function GET(request: Request) {
    // Authorization 헤더에서 토큰 확인
    let token = request.headers.get("Authorization")?.split(" ")[1];
    
    // 헤더에 없으면 쿠키에서 확인
    if (!token) {
        const cookieStore = await cookies();
        token = cookieStore.get("accessToken")?.value;
    }

    const user = token ? verifyAccessToken(token) : null;

    if (!user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    return new Response(JSON.stringify(user), {
        headers: {
            "Content-Type": "application/json"
        }
    });
};