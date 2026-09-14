// Predictive Slotting Engine - Class-to-Canteen Sync
// Formula: Release Time = Arrival ETA - (Standard Prep Time + Queue Wait Time)
// Cloud holds the order until release time, then dispatches directly to Vendor KDS.

import { CAMPUS_DISTANCE_MATRIX } from '../constants/campusData';

/**
 * Calculates predictive scheduling timing for food preparation.
 * 
 * @param {Object} params
 * @param {string} params.buildingId - Current building (e.g. 'bld-b1')
 * @param {string} params.canteenId - Target canteen (e.g. 'canteen-1')
 * @param {number} params.departureOffsetMinutes - Minutes until student leaves class (0 = leave now, 10 = in 10 mins)
 * @param {number} params.standardPrepMinutes - Standard cooking time for menu item (e.g. 5 mins)
 * @param {number} params.currentQueueWaitMinutes - Current accumulated wait time at stall (e.g. 4 mins)
 * @returns {Object} Calculated schedule details
 */
export function calculatePredictiveSlotting({
  buildingId = 'bld-b1',
  canteenId = 'canteen-1',
  departureOffsetMinutes = 0,
  standardPrepMinutes = 5,
  currentQueueWaitMinutes = 0,
}) {
  const now = new Date();
  
  // 1. Get walking time from campus distance matrix
  const buildingDistances = CAMPUS_DISTANCE_MATRIX[buildingId] || {};
  const walkingMinutes = buildingDistances[canteenId] || 5;

  // 2. Calculate Arrival ETA
  // Arrival Time = Now + Departure Offset + Walking Time
  const totalMinutesToArrival = Math.max(1, departureOffsetMinutes + walkingMinutes);
  const arrivalTime = new Date(now.getTime() + totalMinutesToArrival * 60 * 1000);

  // 3. Total required kitchen turnaround time
  const totalKitchenMinutesNeeded = standardPrepMinutes + currentQueueWaitMinutes;

  // 4. Calculate Release Time
  // Release Time = Arrival Time - (Prep Time + Queue Wait Time)
  const minutesUntilRelease = totalMinutesToArrival - totalKitchenMinutesNeeded;
  
  const shouldReleaseImmediately = minutesUntilRelease <= 0;
  const releaseTime = shouldReleaseImmediately
    ? new Date(now.getTime())
    : new Date(now.getTime() + minutesUntilRelease * 60 * 1000);

  // Holding duration in seconds (if held in cloud)
  const holdSecondsRemaining = shouldReleaseImmediately ? 0 : Math.round(minutesUntilRelease * 60);

  return {
    walkingMinutes,
    departureOffsetMinutes,
    totalMinutesToArrival,
    standardPrepMinutes,
    currentQueueWaitMinutes,
    totalKitchenMinutesNeeded,
    minutesUntilRelease: Math.max(0, minutesUntilRelease),
    shouldReleaseImmediately,
    holdSecondsRemaining,
    nowIso: now.toISOString(),
    arrivalTimeIso: arrivalTime.toISOString(),
    releaseTimeIso: releaseTime.toISOString(),
    formattedArrival: formatTime(arrivalTime),
    formattedRelease: formatTime(releaseTime),
  };
}

/**
 * Format date to HH:mm string (Thai local time)
 */
export function formatTime(date) {
  if (!date) return '--:--';
  const d = new Date(date);
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes} น.`;
}

/**
 * Evaluates queue status level & badge color for campus load balancing.
 * 
 * @param {number} waitMinutes
 * @returns {Object} { level: 'low' | 'medium' | 'high', color: string, label: string, badgeBg: string }
 */
export function getQueueStatusBadge(waitMinutes) {
  if (waitMinutes <= 5) {
    return {
      level: 'low',
      color: '#10B981',
      label: 'คิวว่างมาก (< 5 นาที)',
      badgeBg: 'rgba(16, 185, 129, 0.15)',
      traffic: 'green',
      tip: 'พร้อมรับออเดอร์ทันที',
    };
  }
  if (waitMinutes <= 15) {
    return {
      level: 'medium',
      color: '#F59E0B',
      label: 'คิวปานกลาง (10-15 นาที)',
      badgeBg: 'rgba(245, 158, 11, 0.15)',
      traffic: 'yellow',
      tip: 'แนะนำใช้ Predictive Slotting ซิงก์เวลาเดิน',
    };
  }
  return {
    level: 'high',
    color: '#EF4444',
    label: 'คิวหนาแน่น (20+ นาที)',
    badgeBg: 'rgba(239, 68, 68, 0.15)',
    traffic: 'red',
    tip: 'คนเยอะ แนะนำพิจารณาโรงอาหารใกล้เคียง',
  };
}
