import { NextResponse } from "next/server";

export async function GET() {
  // 부산광역시 주요 공영/민영 주차장 Mock Data
  const parkingData = [
    { id: "P1", name: "서면 공영주차장", lat: 35.156, lng: 129.059, capacity: 150, current_parking: 142, type: "공영" },
    { id: "P2", name: "해운대 해수욕장 공영주차장", lat: 35.159, lng: 129.160, capacity: 300, current_parking: 280, type: "공영" },
    { id: "P3", name: "광안리 민락수변공원 주차장", lat: 35.153, lng: 129.123, capacity: 120, current_parking: 45, type: "민영" },
    { id: "P4", name: "부산역 선상주차장", lat: 35.115, lng: 129.041, capacity: 500, current_parking: 410, type: "공영" },
    { id: "P5", name: "남포동 용두산공원 주차장", lat: 35.101, lng: 129.032, capacity: 200, current_parking: 195, type: "공영" },
    { id: "P6", name: "BEXCO 제1주차장", lat: 35.168, lng: 129.136, capacity: 800, current_parking: 320, type: "민영" },
    { id: "P7", name: "센텀시티 신세계백화점 주차장", lat: 35.169, lng: 129.129, capacity: 1200, current_parking: 1150, type: "민영" },
    { id: "P8", name: "송도 해상케이블카 주차장", lat: 35.076, lng: 129.020, capacity: 250, current_parking: 240, type: "공영" },
    { id: "P9", name: "부산시민공원 남문주차장", lat: 35.166, lng: 129.055, capacity: 400, current_parking: 150, type: "공영" },
    { id: "P10", name: "다대포 해변공원 주차장", lat: 35.048, lng: 128.966, capacity: 350, current_parking: 80, type: "공영" },
  ];

  return NextResponse.json({ data: parkingData });
}
