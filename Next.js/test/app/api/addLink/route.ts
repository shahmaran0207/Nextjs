import { NextResponse } from "next/server";
import { getConnection } from "@/util/database";

export async function POST(request: Request) {
    let conn;
    
    try{
        const { links, sectionId } = await request.json();
        conn = await getConnection();

        for ( const link of links ) {
            await conn.execute(
                `INSERT INTO TEST.LINK(SECTIONID, LINKID, SEQ) 
                VALUES (:sectionId, :linkId, :seq)`,
                { sectionId, linkId: link.linkId, seq: link.seq },
                { autoCommit: true }
            );
        }
        return NextResponse.json({result: "ok"});

    } catch(err: any){
        console.log("addLinkError::::::::::::::", err)
        return NextResponse.json({error: err.message}, {status: 500})
    } finally{
        if(conn) await conn.close();
    }
}