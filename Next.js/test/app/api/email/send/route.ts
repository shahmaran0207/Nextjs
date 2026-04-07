import { sendVerificationEmail } from "@/lib/eamil";
import { saveCode } from "@/lib/emailStore";

export async function POST(request: Request) {

    const { email } = await request.json();
    if ( !email ) return Response.json({message: "이메일이 필요합니다."}, {status: 405});

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    saveCode(email, code);

    try{
        await sendVerificationEmail(email, code);
        return Response.json({ message: "메일 전송 성공"}, { status: 200});
    } catch(err) {
        console.error("메일 전송 실패:::::::::::", err);
        return Response.json({message: "메일 전송 실패"}, { status: 500})
    }
}