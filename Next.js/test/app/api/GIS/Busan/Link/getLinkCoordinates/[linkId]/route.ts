import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/GIS/Busan/Link/getLinkCoordinates/{linkId}:
 *   get:
 *     summary: 특정 링크의 좌표 조회
 *     tags: [GIS - Busan]
 *     parameters:
 *       - in: path
 *         name: linkId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 성공
 */
export async function GET(
  request: Request,
  { params }: { params: { linkId: string } }
) {
  try {
    const { linkId } = params;

    const query = `
      SELECT 
        link_id,
        ST_AsGeoJSON(geom) as geom_json
      FROM test.busan_standard_link
      WHERE link_id = $1
      LIMIT 1
    `;

    const result: any[] = await prisma.$queryRawUnsafe(query, linkId);

    if (result.length === 0) {
      return NextResponse.json(
        { error: "링크를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    const geometry = JSON.parse(result[0].geom_json);
    
    return NextResponse.json({
      linkId: result[0].link_id,
      coordinates: geometry.coordinates,
    });
  } catch (err: any) {
    console.error("링크 좌표 조회 API 에러:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
