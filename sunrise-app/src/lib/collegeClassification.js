// src/lib/collegeClassification.js

// A simple map of college names (normalized) to whether they use Common App.
// You can expand this list as needed.
const commonAppSet = new Set([
  "harvard university",
  "princeton university",
  "yale university",
  "columbia university",
  "stanford university",
  "duke university",
  "brown university",
  // ... add more
]);

/**
 * Returns true if the given collegeName (string) is in the hardcoded list of Common App schools.
 */
export function isCommonAppCollege(collegeName) {
  if (!collegeName) return false;
  const norm = collegeName.trim().toLowerCase();
  return commonAppSet.has(norm);
}
