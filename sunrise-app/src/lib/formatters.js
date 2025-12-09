// Utility function to format application type strings
// Place this in: sunrise-app/src/lib/formatters.js

/**
 * Formats application type strings for display
 * @param {string} appType - The raw app type (e.g., "commonApp", "uc", "mit")
 * @returns {string} - Formatted string (e.g., "Common App", "UC", "MIT")
 */
export function formatAppType(appType) {
  if (!appType) return "Other";
  
  const appTypeMap = {
    // Common variations
    'commonApp': 'Common App',
    'common_app': 'Common App',
    'common': 'Common App',
    
    // UC Application
    'uc': 'UC Application',
    'UC': 'UC Application',
    
    // Coalition
    'coalitionApp': 'Coalition App',
    'coalition_app': 'Coalition App',
    'coalition': 'Coalition App',
    
    // MIT
    'mit': 'MIT',
    'MIT': 'MIT',
    
    // Other specific schools
    'stanford': 'Stanford Application',
    'harvard': 'Harvard Application',
    
    // Generic
    'other': 'College-Specific Application',
    'custom': 'Custom Application',
  };
  
  // Check if we have a direct mapping
  if (appTypeMap[appType]) {
    return appTypeMap[appType];
  }
  
  // If no direct mapping, try to format intelligently
  // Convert camelCase or snake_case to Title Case
  return appType
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/_/g, ' ') // Replace underscores with spaces
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim();
}

/**
 * Formats deadline type strings for display
 * @param {string} deadlineType - The raw deadline type (e.g., "earlyDecision", "regularDecision")
 * @returns {string} - Formatted string (e.g., "Early Decision", "Regular Decision")
 */
export function formatDeadlineType(deadlineType) {
  if (!deadlineType) return "";
  
  // Direct mappings for common types
  const deadlineTypeMap = {
    'earlyDecision': 'Early Decision',
    'earlyAction': 'Early Action',
    'regularDecision': 'Regular Decision',
    'restrictiveEarlyAction': 'Restrictive Early Action',
    'rollingAdmission': 'Rolling Admission',
    'priority': 'Priority',
    'ED': 'Early Decision',
    'EA': 'Early Action',
    'RD': 'Regular Decision',
    'REA': 'Restrictive Early Action',
  };
  
  if (deadlineTypeMap[deadlineType]) {
    return deadlineTypeMap[deadlineType];
  }
  
  // Format camelCase or snake_case to Title Case
  return deadlineType
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim();
}

/**
 * Gets a short, display-friendly app type abbreviation
 * @param {string} appType - The raw app type
 * @returns {string} - Short version (e.g., "Common App", "UC", "MIT")
 */
export function getAppTypeShort(appType) {
  const shortMap = {
    'commonApp': 'Common App',
    'common_app': 'Common App',
    'uc': 'UC',
    'coalitionApp': 'Coalition',
    'mit': 'MIT',
    'stanford': 'Stanford',
    'harvard': 'Harvard',
    'other': 'Other',
  };
  
  return shortMap[appType] || formatAppType(appType);
}

/**
 * Formats deadline dates for display, handling "Rolling" admissions
 * @param {string|boolean} deadline - The deadline (date string, "Rolling", or true for rolling)
 * @returns {string} - Formatted deadline string
 */
export function formatDeadline(deadline) {
  if (!deadline) return "No deadline";
  
  // Handle rolling admissions (can be string "Rolling" or boolean true)
  if (deadline === "Rolling" || deadline === "rolling" || deadline === true) {
    return "Rolling Admission";
  }
  
  // Try to format as date
  try {
    const date = new Date(deadline);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return deadline; // Return as-is if invalid
    }
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  } catch (e) {
    return deadline; // Return as-is if error
  }
}