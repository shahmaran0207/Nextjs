import { NextResponse } from "next/server";
import type { CCTVPoint, ITSCctvResponse, CCTVApiSuccessResponse, CCTVApiErrorResponse } from "@/types/cctv";

/**
 * ITS API CCTV 데이터 가져오기
 * GET /api/GIS/Busan/CCTV/getCCTVList
 * 
 * 부산 지역의 HLS HTTPS 스트리밍 CCTV 데이터를 ITS OpenAPI로부터 가져옵니다.
 */
export async function GET() {
  try {
    // 환경 변수에서 API 키 읽기
    const apiKey = process.env.ITS_CCTV_KEY;
    
    // API 키 누락 확인
    if (!apiKey) {
      const errorResponse: CCTVApiErrorResponse = {
        error: "API key not configured",
        details: "ITS_CCTV_KEY environment variable is missing"
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    // ITS API URL 및 파라미터 설정
    const ITS_API_URL = "https://openapi.its.go.kr:9443/cctvInfo";
    const params = new URLSearchParams({
      apiKey: apiKey,
      type: "4",           // HLS HTTPS streaming
      cctvType: "4",       // HLS HTTPS streaming
      minX: "128.8",       // 부산 지역 최소 경도
      maxX: "129.3",       // 부산 지역 최대 경도
      minY: "34.9",        // 부산 지역 최소 위도
      maxY: "35.4",        // 부산 지역 최대 위도
      getType: "json"      // JSON 응답 형식
    });

    // ITS API 호출
    const response = await fetch(`${ITS_API_URL}?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // HTTP 에러 처리
    if (!response.ok) {
      const errorResponse: CCTVApiErrorResponse = {
        error: "ITS API request failed",
        details: `HTTP ${response.status}: ${response.statusText}`
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    // JSON 응답 파싱
    const rawText = await response.text();
    const data: any = JSON.parse(rawText);
    
    // 응답 데이터 검증 및 다양한 응답 구조 처리
    let items: any[] = [];
    
    // 구조 1: response.data (실제 ITS API 구조)
    if (data.response?.data) {
      items = data.response.data;
      console.log("Found items in response.data, count:", items.length);
    }
    // 구조 2: response.body.items (표준 구조)
    else if (data.response?.body?.items) {
      items = data.response.body.items;
      console.log("Found items in response.body.items, count:", items.length);
    }
    // 구조 3: body.items (간소화된 구조)
    else if (data.body?.items) {
      items = data.body.items;
      console.log("Found items in body.items, count:", items.length);
    }
    // 구조 4: items (직접 배열)
    else if (Array.isArray(data.items)) {
      items = data.items;
      console.log("Found items as direct array, count:", items.length);
    }
    // 구조 5: 최상위 배열
    else if (Array.isArray(data)) {
      items = data;
      console.log("Found items as top-level array, count:", items.length);
    }
    
    // 데이터가 없으면 에러
    if (!items || items.length === 0) {
      console.error("No CCTV data found. Response keys:", Object.keys(data));
      if (data.response) {
        console.error("Response keys:", Object.keys(data.response));
      }
      const errorResponse: CCTVApiErrorResponse = {
        error: "Invalid API response",
        details: `No CCTV data found. Response keys: ${Object.keys(data).join(', ')}`
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    // 데이터 변환 (ITS API 형식 → CCTVPoint 형식)
    const normalizedData: CCTVPoint[] = items.map((item, index) => ({
      gid: index + 1,
      lng: parseFloat(item.coordx),
      lat: parseFloat(item.coordy),
      name: item.cctvname,
      url: item.cctvurl,
      type: item.cctvtype,
      format: item.cctvformat
    }));

    // 성공 응답 반환
    const successResponse: CCTVApiSuccessResponse = {
      data: normalizedData
    };

    return NextResponse.json(successResponse, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });

  } catch (error) {
    // 네트워크 에러 또는 예상치 못한 에러 처리
    console.error("CCTV data fetch error:", error);
    
    const errorResponse: CCTVApiErrorResponse = {
      error: "Failed to fetch CCTV data",
      details: error instanceof Error ? error.message : "Unknown error"
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
