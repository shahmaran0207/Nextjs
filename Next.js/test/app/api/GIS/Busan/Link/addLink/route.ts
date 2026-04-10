import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try{
        const { links, sectionId } = await request.json();
    
        await prisma.link.createMany({
            data: links.map((link: {linkid: string; seq: number}) => ({
                sectionid: Number(sectionId),
                linkid: link.linkid,
                seq: link.seq,
            }))
        })

        return NextResponse.json({result: "ok"});
    } catch(err: any){
        console.log("링크 추가 API 에러 ::::::::::::::", err)
        return NextResponse.json({error: err.message}, {status: 500})
    } 
}