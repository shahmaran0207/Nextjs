import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // PostGIS ST_AsGeoJSON으로 geometry를 GeoJSON 문자열로 변환
    const rows = await prisma.$queryRawUnsafe<
      { gid: number; emd_cd: string | null; emd_nm: string | null; geojson: string }[]
    >(
      `SELECT gid, emd_cd, emd_nm, ST_AsGeoJSON(geom)::text AS geojson
       FROM test.busanpolyline
       ORDER BY gid`
    );

    const features = rows.map((row) => ({
      type: "Feature",
      properties: {
        id: row.gid,
        code: row.emd_cd,
        name: row.emd_nm,
      },
      geometry: JSON.parse(row.geojson),
    }));

    return NextResponse.json(
      { type: "FeatureCollection", features },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (err) {
    console.error("getBoundary 에러:", err);
    return NextResponse.json(
      { error: "행정동 경계선 조회 실패" },
      { status: 500 }
    );
  }
}
