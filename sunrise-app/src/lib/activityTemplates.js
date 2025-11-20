export const activityTemplates = {
  commonApp: {
    name: "Common App",
    maxActivities: 10,
    maxAwards: 5,
    sections: {
      activities: {
        label: "Activities",
        max: 10,
        description: "Extracurricular activities and work experience"
      },
      awards: {
        label: "Honors & Awards",
        max: 5,
        description: "Academic honors, awards, and recognition"
      }
    },
    categories: {
      activities: [
        "Academic",
        "Art",
        "Athletics: Club",
        "Athletics: JV/Varsity",
        "Career Oriented",
        "Community Service (Volunteer)",
        "Computer/Technology",
        "Cultural",
        "Dance",
        "Debate/Speech",
        "Environmental",
        "Family Responsibilities",
        "Foreign Exchange",
        "Journalism/Publication",
        "Junior R.O.T.C.",
        "LGBT",
        "Music: Instrumental",
        "Music: Vocal",
        "Religious",
        "Research",
        "Robotics",
        "School Spirit",
        "Science/Math",
        "Student Govt./Politics",
        "Theater/Drama",
        "Work (Paid)",
        "Other Club/Activity"
      ],
      awards: [
        "Academic",
        "Art",
        "Athletics",
        "Community Service",
        "Cultural",
        "Debate/Forensics",
        "Journalism/Publication",
        "Music",
        "Religious",
        "STEM/Science",
        "Student Government",
        "Theater/Drama",
        "Other"
      ]
    },
    fields: {
      activities: [
        {
          key: "section",
          label: "Section",
          type: "hidden",
          value: "activities",
          required: true
        },
        {
          key: "activityCategory",
          label: "Activity Category",
          type: "dropdown",
          options: null, // Will use categories.activities array
          required: true
        },
        {
          key: "activityName",
          label: "Position/Leadership description and organization name",
          type: "text",
          maxLength: 50,
          required: true,
          helpText: "50 characters max"
        },
        {
          key: "description",
          label: "Please describe this activity, including what you accomplished and any recognition you received, etc.",
          type: "textarea",
          maxLength: 150,
          required: true,
          helpText: "150 characters max"
        },
        {
          key: "gradesParticipated",
          label: "Participation grade levels",
          type: "checkboxes",
          options: ["9", "10", "11", "12", "Post-graduate"],
          required: true
        },
        {
          key: "timing",
          label: "Timing of participation",
          type: "checkboxes",
          options: ["School year", "School break", "All year"],
          required: true
        },
        {
          key: "hoursPerWeek",
          label: "Hours spent per week",
          type: "number",
          min: 0,
          max: 168,
          required: true
        },
        {
          key: "weeksPerYear",
          label: "Weeks spent per year",
          type: "number",
          min: 0,
          max: 52,
          required: true
        },
        {
          key: "intendToContinue",
          label: "I intend to participate in a similar activity in college",
          type: "radio",
          options: ["Yes", "No"],
          required: true
        }
      ],
      awards: [
        {
          key: "section",
          label: "Section",
          type: "hidden",
          value: "awards",
          required: true
        },
        {
          key: "awardCategory",
          label: "Honor Category",
          type: "dropdown",
          options: null, // Will use categories.awards array
          required: true
        },
        {
          key: "awardName",
          label: "Honor name",
          type: "text",
          maxLength: 100,
          required: true,
          helpText: "100 characters max"
        },
        {
          key: "description",
          label: "Please describe this honor, noting what it was awarded for and its significance",
          type: "textarea",
          maxLength: 150,
          required: true,
          helpText: "150 characters max"
        },
        {
          key: "gradeReceived",
          label: "Grade level(s) when you received this honor",
          type: "checkboxes",
          options: ["9", "10", "11", "12", "Post-graduate"],
          required: true
        },
        {
          key: "recognitionLevel",
          label: "Level of recognition",
          type: "dropdown",
          options: ["School", "State/Regional", "National", "International"],
          required: true
        }
      ]
    }
  },

  uc: {
    name: "UC Application",
    maxActivities: 20,
    categories: [
      "Coursework other than A-G",
      "Educational preparation programs",
      "Volunteer & Community service",
      "Work experience",
      "Awards or honors",
      "Extracurricular activities"
    ],
    // Different character limits based on category
    categoryLimits: {
      "Coursework other than A-G": {
        nameLimit: 50,
        descriptionLimit: 350,
        fields: ["courseName", "description", "grades"]
      },
      "Educational preparation programs": {
        nameLimit: 50,
        descriptionLimit: 350,
        fields: ["programName", "description", "grades", "hours"]
      },
      "Volunteer & Community service": {
        nameLimit: 50,
        descriptionLimit: 350,
        fields: ["activityName", "description", "grades", "hoursPerWeek", "weeksPerYear"]
      },
      "Work experience": {
        nameLimit: 50,
        descriptionLimit: 350,
        fields: ["employerName", "jobTitle", "description", "grades", "hoursPerWeek", "weeksPerYear"]
      },
      "Awards or honors": {
        nameLimit: 50,
        descriptionLimit: 350,
        fields: ["awardName", "description", "gradeReceived", "recognitionLevel"]
      },
      "Extracurricular activities": {
        nameLimit: 50,
        descriptionLimit: 350,
        fields: ["activityName", "role", "description", "grades", "hoursPerWeek", "weeksPerYear"]
      }
    },
    fields: [
      {
        key: "category",
        label: "Activity Category",
        type: "dropdown",
        options: null, // Will use categories array
        required: true
      },
      // Common fields
      {
        key: "activityName",
        label: "Activity/Program/Course Name",
        type: "text",
        maxLength: 50,
        required: true,
        helpText: "50 characters max"
      },
      {
        key: "role",
        label: "Position/Leadership",
        type: "text",
        maxLength: 50,
        required: false,
        showIf: (data) => ["Extracurricular activities", "Volunteer & Community service"].includes(data.category)
      },
      {
        key: "description",
        label: "Description",
        type: "textarea",
        maxLength: 350,
        required: true,
        helpText: "350 characters max. Describe your participation, responsibilities, and achievements."
      },
      {
        key: "gradesParticipated",
        label: "Grade level(s)",
        type: "checkboxes",
        options: ["9", "10", "11", "12"],
        required: true
      },
      {
        key: "hoursPerWeek",
        label: "Hours per week",
        type: "number",
        min: 0,
        max: 168,
        required: true,
        showIf: (data) => !["Awards or honors", "Coursework other than A-G"].includes(data.category)
      },
      {
        key: "weeksPerYear",
        label: "Weeks per year",
        type: "number",
        min: 0,
        max: 52,
        required: true,
        showIf: (data) => !["Awards or honors", "Coursework other than A-G"].includes(data.category)
      },
      {
        key: "recognitionLevel",
        label: "Level of recognition",
        type: "dropdown",
        options: ["School", "District/Region", "State", "National", "International"],
        required: true,
        showIf: (data) => data.category === "Awards or honors"
      },
      {
        key: "gradeReceived",
        label: "Grade level when you received this honor",
        type: "dropdown",
        options: ["9", "10", "11", "12"],
        required: true,
        showIf: (data) => data.category === "Awards or honors"
      }
    ]
  },

  mit: {
    name: "MIT Application",
    maxActivities: 5,
    categories: [
      "Activities",
      "Awards/Honors"
    ],
    fields: [
      {
        key: "category",
        label: "Type",
        type: "radio",
        options: ["Activities", "Awards/Honors"],
        required: true
      },
      {
        key: "activityName",
        label: "Activity/Award Name",
        type: "text",
        maxLength: 100,
        required: true,
        helpText: "100 characters max"
      },
      {
        key: "description",
        label: "What you did (Activities) / What you achieved (Awards)",
        type: "textarea",
        maxLength: 200,
        required: true,
        helpText: "200 characters max. Be specific about your role, impact, and achievements."
      },
      {
        key: "gradesParticipated",
        label: "Grade levels",
        type: "checkboxes",
        options: ["9", "10", "11", "12"],
        required: true
      },
      {
        key: "hoursPerWeek",
        label: "Approximate hours per week",
        type: "number",
        min: 0,
        max: 168,
        required: true,
        showIf: (data) => data.category === "Activities"
      },
      {
        key: "weeksPerYear",
        label: "Approximate weeks per year",
        type: "number",
        min: 0,
        max: 52,
        required: true,
        showIf: (data) => data.category === "Activities"
      }
    ]
  },

  coalitionApp: {
    name: "Coalition Application",
    maxActivities: 8,
    categories: [
      "Academic Interest",
      "Arts",
      "Athletics",
      "Community Service",
      "Employment",
      "Extracurricular",
      "Family Responsibilities",
      "Other",
      "Religious",
      "Research"
    ],
    fields: [
      {
        key: "activityCategory",
        label: "Activity Category",
        type: "dropdown",
        options: null, // Will use categories array
        required: true
      },
      {
        key: "activityName",
        label: "Activity Name",
        type: "text",
        maxLength: 100,
        required: true,
        helpText: "100 characters max"
      },
      {
        key: "role",
        label: "Your role or position",
        type: "text",
        maxLength: 100,
        required: false,
        helpText: "100 characters max"
      },
      {
        key: "description",
        label: "Description of your involvement and accomplishments",
        type: "textarea",
        maxLength: 250,
        required: true,
        helpText: "250 characters max"
      },
      {
        key: "gradesParticipated",
        label: "Grade levels participated",
        type: "checkboxes",
        options: ["9", "10", "11", "12", "Post-graduate"],
        required: true
      },
      {
        key: "timing",
        label: "When did you participate?",
        type: "checkboxes",
        options: ["During school year", "During school break", "All year"],
        required: true
      },
      {
        key: "hoursPerWeek",
        label: "Hours per week",
        type: "number",
        min: 0,
        max: 168,
        required: true
      },
      {
        key: "weeksPerYear",
        label: "Weeks per year",
        type: "number",
        min: 0,
        max: 52,
        required: true
      }
    ]
  },

  other: {
    name: "Other/Generic Application",
    maxActivities: 15,
    categories: [
      "Academic",
      "Arts/Music",
      "Athletics",
      "Community Service",
      "Employment",
      "Leadership",
      "Awards/Honors",
      "Other"
    ],
    fields: [
      {
        key: "activityCategory",
        label: "Activity Category",
        type: "dropdown",
        options: null,
        required: true
      },
      {
        key: "activityName",
        label: "Activity/Award Name",
        type: "text",
        maxLength: 100,
        required: true,
        helpText: "100 characters max"
      },
      {
        key: "role",
        label: "Your role or position",
        type: "text",
        maxLength: 100,
        required: false
      },
      {
        key: "description",
        label: "Description of involvement and accomplishments",
        type: "textarea",
        maxLength: 500,
        required: true,
        helpText: "500 characters max"
      },
      {
        key: "gradesParticipated",
        label: "Grade levels",
        type: "checkboxes",
        options: ["9", "10", "11", "12", "Post-graduate"],
        required: true
      },
      {
        key: "hoursPerWeek",
        label: "Hours per week",
        type: "number",
        min: 0,
        max: 168,
        required: false
      },
      {
        key: "weeksPerYear",
        label: "Weeks per year",
        type: "number",
        min: 0,
        max: 52,
        required: false
      }
    ]
  }
};

// Helper function to get template by app type
export function getTemplateByAppType(appType) {
  const normalizedType = appType?.toLowerCase().replace(/[_\s]/g, '');
  
  const typeMap = {
    'commonapp': 'commonApp',
    'common': 'commonApp',
    'uc': 'uc',
    'mit': 'mit',
    'coalitionapp': 'coalitionApp',
    'coalition': 'coalitionApp',
    'other': 'other'
  };
  
  return activityTemplates[typeMap[normalizedType]] || activityTemplates.other;
}

// Helper to get fields for a specific section (for Common App activities vs awards)
export function getFieldsForSection(template, section = null) {
  // For Common App, return fields based on section
  if (template.fields && typeof template.fields === 'object' && !Array.isArray(template.fields)) {
    return template.fields[section] || template.fields.activities || [];
  }
  
  // For other templates, return fields array directly
  return template.fields || [];
}

// Helper to get categories for a specific section
export function getCategoriesForSection(template, section = null) {
  // For Common App with separate categories
  if (template.categories && typeof template.categories === 'object' && !Array.isArray(template.categories)) {
    return template.categories[section] || template.categories.activities || [];
  }
  
  // For other templates, return categories array directly
  return template.categories || [];
}

// Helper to initialize form state for a template
export function initializeFormState(template, section = null) {
  const state = {};
  const fields = getFieldsForSection(template, section);
  
  fields.forEach(field => {
    if (field.type === 'checkboxes') {
      state[field.key] = [];
    } else if (field.type === 'number') {
      state[field.key] = '';
    } else if (field.type === 'hidden' && field.value) {
      state[field.key] = field.value;
    } else {
      state[field.key] = '';
    }
  });
  
  // Add section if provided
  if (section) {
    state.section = section;
  }
  
  return state;
}

// Check if template has sections (like Common App)
export function templateHasSections(template) {
  return template.sections && Object.keys(template.sections).length > 0;
}

// Get max items for a section
export function getMaxItemsForSection(template, section) {
  if (template.sections && template.sections[section]) {
    return template.sections[section].max;
  }
  return template.maxActivities || 10;
}

// Validate character limits
export function validateCharacterLimit(value, maxLength) {
  if (!value) return true;
  return value.length <= maxLength;
}

// Get character count display
export function getCharacterCount(value, maxLength) {
  const count = value ? value.length : 0;
  return `${count}/${maxLength}`;
}


