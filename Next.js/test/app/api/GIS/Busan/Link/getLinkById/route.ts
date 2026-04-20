import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/GIS/Busan/Link/getLinkById:
 *   get:
 *     summary: 특정 링크 ID로 링크 조회
 *     tags: [GIS - Busan]
 *     parameters:
 *       - in: query
 *         name: linkId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 성공
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const linkId = searchParams.get("linkId");

    if (!linkId) {
      return NextResponse.json(
        { error: "linkId 파라미터가 필요합니다" },
        { status: 400 }
      );
    }

    const query = `
      SELECT 
        l.fid,
        l.link_id,
        l.f_node,
        l.t_node,
        l.road_rank,
        l.road_name,
        l.max_spd,
        l.lanes,
        ST_AsGeoJSON(l.geom) as geom_json,
        fn.node_id as f_node_id,
        ST_X(fn.geom) as f_node_lng,
        ST_Y(fn.geom) as f_node_lat,
        tn.node_id as t_node_id,
        ST_X(tn.geom) as t_node_lng,
        ST_Y(tn.geom) as t_node_lat
      FROM test.busan_standard_link l
      LEFT JOIN test.busan_standard_node fn ON l.f_node = fn.node_id
      LEFT JOIN test.busan_standard_node tn ON l.t_node = tn.node_id
      WHERE l.link_id = $1
      LIMIT 1
    `;

    const result: any[] = await prisma.$queryRawUnsafe(query, linkId);

    if (result.length === 0) {
      return NextResponse.json(
        { error: "링크를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    const row = result[0];
    const feature = {
      type: "Feature",
      properties: {
        link_id: row.link_id,
        f_node: row.f_node,
        t_node: row.t_node,
        road_rank: row.road_rank,
        road_name: row.road_name,
        max_spd: row.max_spd ? Number(row.max_spd) : null,
        lanes: row.lanes ? Number(row.lanes) : null,
        f_node_lng: row.f_node_lng ? Number(row.f_node_lng) : null,
        f_node_lat: row.f_node_lat ? Number(row.f_node_lat) : null,
        t_node_lng: row.t_node_lng ? Number(row.t_node_lng) : null,
        t_node_lat: row.t_node_lat ? Number(row.t_node_lat) : null,
      },
      geometry: JSON.parse(row.geom_json),
    };

    return NextResponse.json({ feature });
  } catch (err: any) {
    console.error("링크 조회 API 에러:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
