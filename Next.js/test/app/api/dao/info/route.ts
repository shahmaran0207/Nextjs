import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), "blockchain-study", "deployed", "land-dao-address.json");
        const data = fs.readFileSync(filePath, "utf-8");
        return NextResponse.json(JSON.parse(data));
    } catch (err) {
        console.error("Failed to read DAO address:", err);
        return NextResponse.json({ error: "DAO 정보를 불러올 수 없습니다." }, { status: 500 });
    }
}
