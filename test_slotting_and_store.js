// Unit Test for SUT Canteen Express Predictive Slotting & Core Engine
const assert = require('assert');

// Test calculatePredictiveSlotting logic
function calculatePredictiveSlottingTest({
  walkingMinutes = 5,
  departureOffsetMinutes = 10,
  standardPrepMinutes = 5,
  currentQueueWaitMinutes = 4,
}) {
  const totalMinutesToArrival = departureOffsetMinutes + walkingMinutes;
  const totalKitchenMinutesNeeded = standardPrepMinutes + currentQueueWaitMinutes;
  const minutesUntilRelease = totalMinutesToArrival - totalKitchenMinutesNeeded;
  const shouldReleaseImmediately = minutesUntilRelease <= 0;
  const holdSecondsRemaining = shouldReleaseImmediately ? 0 : Math.round(minutesUntilRelease * 60);

  return {
    totalMinutesToArrival,
    totalKitchenMinutesNeeded,
    minutesUntilRelease: Math.max(0, minutesUntilRelease),
    shouldReleaseImmediately,
    holdSecondsRemaining,
  };
}

console.log('--- TEST 1: Predictive Slotting Formula ---');
// Case A: Student is 10 mins before leaving B1, walks 1 min to Canteen 1. Prep=5m, Queue=4m
const resA = calculatePredictiveSlottingTest({
  walkingMinutes: 1,
  departureOffsetMinutes: 10,
  standardPrepMinutes: 5,
  currentQueueWaitMinutes: 4,
});
console.log('Result A:', resA);
assert.strictEqual(resA.totalMinutesToArrival, 11, 'Total arrival should be 11 mins');
assert.strictEqual(resA.totalKitchenMinutesNeeded, 9, 'Kitchen needs 9 mins');
assert.strictEqual(resA.minutesUntilRelease, 2, 'Should release in 2 mins');
assert.strictEqual(resA.holdSecondsRemaining, 120, 'Should hold in cloud for 120 seconds');
assert.strictEqual(resA.shouldReleaseImmediately, false);
console.log('✓ Case A Passed (Cloud Holding correctly delayed)');

// Case B: Student is already walking (offset=0, walk=4 mins), Kitchen needs 6 mins
const resB = calculatePredictiveSlottingTest({
  walkingMinutes: 4,
  departureOffsetMinutes: 0,
  standardPrepMinutes: 4,
  currentQueueWaitMinutes: 2,
});
console.log('Result B:', resB);
assert.strictEqual(resB.shouldReleaseImmediately, true, 'Should release immediately');
assert.strictEqual(resB.holdSecondsRemaining, 0);
console.log('✓ Case B Passed (Immediate release when walking time < prep time)');

console.log('\n--- TEST 2: Haversine Distance & Campus Geofence ---');
function getHaversineDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
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

// Distance between SUT B1 (14.8785, 102.0192) and Canteen 1 (14.8783, 102.0195)
const distB1 = getHaversineDistanceMeters(14.8785, 102.0192, 14.8783, 102.0195);
console.log(`Distance from B1 to Canteen 1: ${distB1.toFixed(1)} meters`);
assert(distB1 < 100, 'B1 should be under 100 meters to Canteen 1');
console.log('✓ Geofence Distance calculation verified');

console.log('\nALL 2 TEST SUITES PASSED SUCCESSFULLY! 🚀');
