// src/lib/collegeLoader.js

// Import all college JSON files
import berkeley from '../data/colleges/berkeley.json';
import centralWashingtonUniversity from '../data/colleges/central-washington-university.json';
import columbia from '../data/colleges/columbia.json';
import duke from '../data/colleges/duke.json';
import harvard from '../data/colleges/harvard-university.json';
import mit from '../data/colleges/mit.json';
import stanford from '../data/colleges/stanford-university.json';
import ucla from '../data/colleges/ucla.json';
import umich from '../data/colleges/umich.json';
import uw from '../data/colleges/uw.json';

const collegeFiles = {
  'uc-berkeley': berkeley,
  'central-washington-university': centralWashingtonUniversity,
  'columbia-university': columbia,
  'duke-university': duke,
  'harvard-university': harvard,
  'mit': mit,
  'stanford-university': stanford,
  'uc-los-angeles': ucla,
  'university-of-michigan': umich,
  'university-of-washington': uw,
};

/**
 * Get all colleges as an array
 * @returns {Array} Array of college objects sorted alphabetically
 */
export function getAllColleges() {
  return Object.values(collegeFiles).sort((a, b) => 
    a.university.localeCompare(b.university)
  );
}

/**
 * Get a specific college by ID
 * @param {string} id - The college ID
 * @returns {Object|null} College object or null if not found
 */
export function getCollegeById(id) {
  return collegeFiles[id] || null;
}

/**
 * Search colleges by name
 * @param {string} searchTerm - The search term
 * @returns {Array} Array of matching college objects
 */
export function searchColleges(searchTerm) {
  if (!searchTerm) return getAllColleges();
  
  const term = searchTerm.toLowerCase();
  return getAllColleges().filter(college =>
    college.university.toLowerCase().includes(term)
  );
}

/**
 * Filter colleges by criteria
 * @param {Object} filters - Filter criteria
 * @returns {Array} Array of matching college objects
 */
export function filterColleges(filters = {}) {
  let colleges = getAllColleges();

  // Filter by region
  if (filters.region && filters.region !== 'All') {
    colleges = colleges.filter(c => c.region === filters.region);
  }

  // Filter by cost type (public/private)
  if (filters.costType && filters.costType !== 'All') {
    colleges = colleges.filter(c => c.total_cost.type === filters.costType);
  }

  // Filter by GPA range
  if (filters.gpa) {
    colleges = colleges.filter(c => {
      const gpa = parseFloat(filters.gpa);
      return gpa >= c.middle_50_percent.GPA_unweighted.low &&
             gpa <= c.middle_50_percent.GPA_unweighted.high;
    });
  }

  // Filter by SAT score
  if (filters.sat) {
    colleges = colleges.filter(c => {
      const sat = parseInt(filters.sat);
      return sat >= c.middle_50_percent.SAT_ACT.SAT.low &&
             sat <= c.middle_50_percent.SAT_ACT.SAT.high;
    });
  }

  // Filter by major prestige
  if (filters.major && filters.prestigeLevel) {
    colleges = colleges.filter(c => {
      const area = c.areas_of_interest[filters.major];
      return area && area.prestige >= parseInt(filters.prestigeLevel);
    });
  }

  return colleges;
}

/**
 * Get colleges by application type
 * @param {string} appType - The application type (commonApp, uc, etc.)
 * @returns {Array} Array of matching college objects
 */
export function getCollegesByAppType(appType) {
  return getAllColleges().filter(c => 
    c.application_info.app_type === appType
  );
}

/**
 * Get recommended colleges based on user profile
 * @param {Object} userProfile - User's academic profile
 * @returns {Array} Array of recommended college objects
 */
export function getRecommendedColleges(userProfile) {
  const { gpa, sat, act, testType, location, costPref, majorPrestige, major } = userProfile;
  
  let colleges = getAllColleges();
  
  // Filter by location preference
  if (location && location !== 'None') {
    colleges = colleges.filter(c => c.region === location);
  }
  
  // Filter by cost preference
  if (costPref && costPref !== 'none') {
    colleges = colleges.filter(c => c.total_cost.type === costPref);
  }
  
  // Score each college based on fit
  const scoredColleges = colleges.map(college => {
    let score = 0;
    
    // GPA match
    const gpaFloat = parseFloat(gpa);
    if (gpaFloat >= college.middle_50_percent.GPA_unweighted.low &&
        gpaFloat <= college.middle_50_percent.GPA_unweighted.high) {
      score += 30; // Target school
    } else if (gpaFloat > college.middle_50_percent.GPA_unweighted.high) {
      score += 20; // Safety school
    } else if (gpaFloat >= college.middle_50_percent.GPA_unweighted.low - 0.2) {
      score += 10; // Reach school
    }
    
    // Test score match
    if (testType === 'SAT' && sat) {
      const satInt = parseInt(sat);
      if (satInt >= college.middle_50_percent.SAT_ACT.SAT.low &&
          satInt <= college.middle_50_percent.SAT_ACT.SAT.high) {
        score += 30;
      } else if (satInt > college.middle_50_percent.SAT_ACT.SAT.high) {
        score += 20;
      } else if (satInt >= college.middle_50_percent.SAT_ACT.SAT.low - 100) {
        score += 10;
      }
    }
    
    if (testType === 'ACT' && act) {
      const actInt = parseInt(act);
      if (actInt >= college.middle_50_percent.SAT_ACT.ACT.low &&
          actInt <= college.middle_50_percent.SAT_ACT.ACT.high) {
        score += 30;
      } else if (actInt > college.middle_50_percent.SAT_ACT.ACT.high) {
        score += 20;
      } else if (actInt >= college.middle_50_percent.SAT_ACT.ACT.low - 2) {
        score += 10;
      }
    }
    
    // Major prestige match
    if (major && majorPrestige && college.areas_of_interest[major]) {
      const collegeMajorPrestige = college.areas_of_interest[major].prestige;
      if (collegeMajorPrestige >= parseInt(majorPrestige)) {
        score += 40;
      } else if (collegeMajorPrestige >= parseInt(majorPrestige) - 1) {
        score += 20;
      }
    }
    
    return { ...college, matchScore: score };
  });
  
  // Return top matches
  return scoredColleges
    .filter(c => c.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 20);
}