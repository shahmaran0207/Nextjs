import { NextResponse } from "next/server";
import { getConnection } from "@/util/database";
import { Next } from "@nestjs/common";

export async function POST(request: Request, { params }: {params: Promise<{id: string}>}) {
    const { id } = await params;

    let conn;
    try {
        conn = await getConnection();
        await conn.execute(
            `UPDATE TEST.POST SET POST_VIEW = POST_VIEW+1 
                WHERE ID =:id`,
            { id },
            { autoCommit: true}
        );

        return NextResponse.json({success: true});
    } catch(err: any) {
        console.log("View Count API error::::::::::::", err);
        return NextResponse.json({error: err.message}, {status: 500})
    } finally {
        if (conn) await conn.close();
    }
}