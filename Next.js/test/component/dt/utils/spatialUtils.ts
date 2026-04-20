/**
 * Calculate Haversine distance between two points
 * @param point1 - First point [lng, lat]
 * @param point2 - Second point [lng, lat]
 * @returns Distance in meters
 * 
 * Property 2: Spatial Radius Filtering
 * For any center point and radius, all returned items SHALL be within 
 * the specified radius when measured using Haversine distance.
 */
export function haversineDistance(
  point1: [number, number],
  point2: [number, number]
): number {
  const [lng1, lat1] = point1;
  const [lng2, lat2] = point2;
  
  const R = 6371000; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Check if a point is within a radius from a center point
 * @param point - Point to check [lng, lat]
 * @param center - Center point [lng, lat]
 * @param radiusMeters - Radius in meters
 * @returns true if point is within radius, false otherwise
 */
export function isWithinRadius(
  point: [number, number],
  center: [number, number],
  radiusMeters: number
): boolean {
  const distance = haversineDistance(point, center);
  return distance <= radiusMeters;
}

/**
 * Calculate distance from a point to a line segment
 * @param point - Point [lng, lat]
 * @param segStart - Line segment start [lng, lat]
 * @param segEnd - Line segment end [lng, lat]
 * @returns Distance in meters
 */
export function pointToSegmentDistance(
  point: [number, number],
  segStart: [number, number],
  segEnd: [number, number]
): number {
  const [px, py] = point;
  const [x1, y1] = segStart;
  const [x2, y2] = segEnd;

  // Calculate the squared length of the segment
  const segLengthSq = (x2 - x1) ** 2 + (y2 - y1) ** 2;

  // If segment is a point, return distance to that point
  if (segLengthSq === 0) {
    return haversineDistance(point, segStart);
  }

  // Calculate projection parameter t
  // t represents where the projection of point falls on the segment
  // t = 0 means at segStart, t = 1 means at segEnd
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / segLengthSq;

  // Clamp t to [0, 1] to stay within the segment
  t = Math.max(0, Math.min(1, t));

  // Calculate the closest point on the segment
  const closestPoint: [number, number] = [
    x1 + t * (x2 - x1),
    y1 + t * (y2 - y1),
  ];

  // Return distance from point to closest point on segment
  return haversineDistance(point, closestPoint);
}

/**
 * Calculate distance from a point to a line (polyline)
 * @param point - Point [lng, lat]
 * @param line - Array of points forming a line [[lng, lat], ...]
 * @returns Distance in meters
 */
export function pointToLineDistance(
  point: [number, number],
  line: [number, number][]
): number {
  if (line.length === 0) return Infinity;
  if (line.length === 1) return haversineDistance(point, line[0]);

  let minDist = Infinity;

  for (let i = 0; i < line.length - 1; i++) {
    const segmentDist = pointToSegmentDistance(point, line[i], line[i + 1]);
    minDist = Math.min(minDist, segmentDist);
  }

  return minDist;
}

/**
 * Clamp radius to valid range [100, 2000] meters
 * @param radius - Radius in meters
 * @returns Clamped radius
 */
export function clampRadius(radius: number): number {
  return Math.max(100, Math.min(2000, radius));
}

/**
 * Calculate bounding box for a center point and radius
 * @param center - Center point [lng, lat]
 * @param radiusMeters - Radius in meters
 * @returns Bounding box [minLng, minLat, maxLng, maxLat]
 */
export function getBoundingBox(
  center: [number, number],
  radiusMeters: number
): [number, number, number, number] {
  const [lng, lat] = center;
  
  // Approximate degrees per meter at this latitude
  const latDegPerMeter = 1 / 111320;
  const lngDegPerMeter = 1 / (111320 * Math.cos((lat * Math.PI) / 180));
  
  const latOffset = radiusMeters * latDegPerMeter;
  const lngOffset = radiusMeters * lngDegPerMeter;
  
  return [
    lng - lngOffset, // minLng
    lat - latOffset, // minLat
    lng + lngOffset, // maxLng
    lat + latOffset, // maxLat
  ];
}
