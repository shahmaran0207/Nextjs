import { verifyToken } from "@/utils/auth";

export async function GET(request: Request) {
    const token = request.headers.get("Authorization")?.split(" ")[1];
    const user = token ? verifyToken(token) : null;

    if (!user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    return new Response(JSON.stringify(user), {
        headers: {
            "Content-Type": "application/json"
        }
    });
};