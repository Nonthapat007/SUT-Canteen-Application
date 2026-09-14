// SUT Campus Location & Geofencing Engine
import { SUT_BUILDINGS, SUT_CANTEENS, CAMPUS_DISTANCE_MATRIX } from '../constants/campusData';

/**
 * Calculates distance between two GPS coordinates using Haversine formula (in meters)
 */
export function getHaversineDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Identify closest academic building from coordinates
 */
export function findClosestBuilding(coords) {
  if (!coords || !coords.latitude || !coords.longitude) {
    return SUT_BUILDINGS[0]; // Default to B1
  }

  let closest = SUT_BUILDINGS[0];
  let minDistance = Infinity;

  SUT_BUILDINGS.forEach((bld) => {
    const dist = getHaversineDistanceMeters(
      coords.latitude,
      coords.longitude,
      bld.lat,
      bld.lng
    );
    if (dist < minDistance) {
      minDistance = dist;
      closest = bld;
    }
  });

  return {
    ...closest,
    distanceMeters: Math.round(minDistance),
  };
}

/**
 * Identify closest canteen for a given building or GPS coordinates (Smart Default Location)
 */
export function getSmartDefaultCanteen(buildingId) {
  const distances = CAMPUS_DISTANCE_MATRIX[buildingId] || {};
  
  let bestCanteenId = 'canteen-1';
  let minWalk = Infinity;

  Object.entries(distances).forEach(([cId, walkTime]) => {
    if (walkTime < minWalk) {
      minWalk = walkTime;
      bestCanteenId = cId;
    }
  });

  const canteen = SUT_CANTEENS.find((c) => c.id === bestCanteenId) || SUT_CANTEENS[0];
  return {
    ...canteen,
    walkingMinutes: minWalk,
  };
}

/**
 * Returns all 6 canteens sorted by walking proximity to the current building
 */
export function getCanteensWithProximity(buildingId) {
  const distances = CAMPUS_DISTANCE_MATRIX[buildingId] || {};

  return SUT_CANTEENS.map((canteen) => {
    const walkMins = distances[canteen.id] ?? 8;
    return {
      ...canteen,
      walkingMinutes: walkMins,
      // Total estimated time until food in hand if ordered normally:
      totalMinutesWithQueue: canteen.baseQueueMinutes + walkMins,
    };
  }).sort((a, b) => a.walkingMinutes - b.walkingMinutes);
}
