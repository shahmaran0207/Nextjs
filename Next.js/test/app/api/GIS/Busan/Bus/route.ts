/**
 * @swagger
 * /api/GIS/Busan/Bus:
 *   get:
 *     summary: 부산 버스 정류장 목록 조회
 *     description: 부산광역시 버스 정보 안내기 설치 현황 조회 API
 *     tags: [GIS - Busan]
 *     parameters:
 *       - in: query
 *         name: pageNo
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: numOfRows
 *         schema:
 *           type: integer
 *           default: 9999
 *         description: 한 페이지 결과 수
 *       - in: query
 *         name: stationLoc
 *         schema:
 *           type: string
 *         description: 위치명(정류장명) - 예) 영주삼거리
 *       - in: query
 *         name: resultType
 *         schema:
 *           type: string
 *           enum: [xml, json]
 *           default: xml
 *         description: 응답 형식 (json 호출 시 resultType=json)
 *     responses:
 *       200:
 *         description: 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   stationNum:
 *                     type: string
 *                     description: 정류장번호
 *                     example: "1001"
 *                   stationLoc:
 *                     type: string
 *                     description: 위치명(정류장명)
 *                     example: "영주삼거리"
 *                   lat:
 *                     type: number
 *                     description: 좌표정보(위도)
 *                     example: 35.163125
 *                   lng:
 *                     type: number
 *                     description: 좌표정보(경도)
 *                     example: 129.107037
 *                   addr:
 *                     type: string
 *                     description: 주소
 *                     example: "부산광역시"
 *                   dataDay:
 *                     type: string
 *                     description: 데이터기준일자
 *                     example: "2018-10-31"
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: 에러 메시지
 */
export async function GET() {
  try {
    const url = `http://apis.data.go.kr/6260000/BusanTblBusinfoeqStusService/getTblBusinfoeqStusInfo?serviceKey=${process.env.DATA_API_KEY}&numOfRows=9999`;

    const res = await fetch(url);
    const text = await res.text();

    // XML 파싱
    const items = [...text.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((match) => {
      const item = match[1];
      const get = (tag: string) => item.match(new RegExp(`<${tag}>(.*?)<\/${tag}>`))?.[1]?.trim() ?? "";
      return {
        stationNum: get("stationNum"),
        stationLoc: get("stationLoc"),
        lat: parseFloat(get("lat")),
        lng: parseFloat(get("lng")),
        addr: get("addr"),
        dataDay: get("dataDay"),
      };
    });

    return Response.json(items);
  } catch (err: any) {
    console.error("에러:", err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
}