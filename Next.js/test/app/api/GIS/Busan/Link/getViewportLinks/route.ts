import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * 뷰포트 기반 표준링크 데이터 가져오기
 * GET /api/GIS/Busan/Link/getViewportLinks?minLng=129.0&maxLng=129.2&minLat=35.1&maxLat=35.3&zoom=12
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 쿼리 파라미터 파싱
    const minLng = parseFloat(searchParams.get("minLng") || "128.8");
    const maxLng = parseFloat(searchParams.get("maxLng") || "129.3");
    const minLat = parseFloat(searchParams.get("minLat") || "34.9");
    const maxLat = parseFloat(searchParams.get("maxLat") || "35.4");
    const zoom = parseInt(searchParams.get("zoom") || "12");

    // 줌 레벨에 따른 도로 등급 필터링
    // 줌이 낮을수록 주요 도로만 표시
    let roadRankFilter = "";
    if (zoom < 11) {
      // 고속도로, 국도만
      roadRankFilter = "AND road_rank IN ('101', '102', '103', '104', '105', '106')";
    } else if (zoom < 13) {
      // 고속도로, 국도, 지방도
      roadRankFilter = "AND road_rank IN ('101', '102', '103', '104', '105', '106', '107')";
    }
    // zoom >= 13: 모든 도로 표시

    // PostGIS ST_Intersects를 사용한 공간 쿼리
    // BOX를 만들어서 해당 영역과 교차하는 링크만 가져오기
    // LEFT JOIN으로 from/to 노드 좌표도 함께 가져오기
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
      WHERE l.geom && ST_MakeEnvelope($1, $2, $3, $4, 4326)
      ${roadRankFilter}
      LIMIT 10000
    `;

    const result: any[] = await prisma.$queryRawUnsafe(
      query,
      minLng,
      minLat,
      maxLng,
      maxLat
    );

    // GeoJSON Feature Collection 형식으로 변환
    const features = result.map((row) => ({
      type: "Feature",
      properties: {
        link_id: row.link_id,
        f_node: row.f_node,
        t_node: row.t_node,
        road_rank: row.road_rank,
        road_name: row.road_name,
        max_spd: row.max_spd ? Number(row.max_spd) : null,
        lanes: row.lanes ? Number(row.lanes) : null,
        // from 노드 좌표
        f_node_lng: row.f_node_lng ? Number(row.f_node_lng) : null,
        f_node_lat: row.f_node_lat ? Number(row.f_node_lat) : null,
        // to 노드 좌표
        t_node_lng: row.t_node_lng ? Number(row.t_node_lng) : null,
        t_node_lat: row.t_node_lat ? Number(row.t_node_lat) : null,
      },
      geometry: JSON.parse(row.geom_json),
    }));

    const geojson = {
      type: "FeatureCollection",
      features,
    };

    return NextResponse.json(geojson, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600", // 1시간 캐싱
      },
    });
  } catch (err: any) {
    console.error("뷰포트 링크 조회 API 에러:", err);
    console.error("에러 상세:", {
      message: err.message,
      stack: err.stack,
      name: err.name,
    });
    return NextResponse.json(
      {
        error: err.message,
        details: err.stack,
        type: err.name,
      },
      { status: 500 }
    );
  }
}
