import { getCode, deleteCode } from "@/lib/emailStore";

export async function POST(request: Request) {
    const { email, code} = await request.json();
    if (!email || !code ) return Response.json({message: "값이 부족합니다."}, {status: 400});

    const record = getCode(email);
    if(!record) return Response.json({ message: "인증 요청이 없습니다."}, {status: 400});

    if(Date.now()>record.expiresAt) {
        deleteCode(email);
        return Response.json({message: "인증 코드가 만료되었습니다."}, {status: 401})
    };

    if(record.code != code) return Response.json({ message: "인증 코드가 올바르지 않습니다."}, {status: 401});

    deleteCode(email)
    return Response.json({message: "이메일 인증 성공"}, { status: 200})
}