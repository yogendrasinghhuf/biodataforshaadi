// Generate height options from 3'5" to 7'8" with cm in brackets
const generateHeightOptions = () => {
  const heights = [];
  for (let totalInches = 41; totalInches <= 92; totalInches++) {
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches % 12;
    const cm = Math.round(totalInches * 2.54);
    heights.push(`${feet} ft ${inches} inch (${cm} cm)`);
  }
  return heights;
};

export const religionSpecificFields = {
  hindu: {
    name: 'Hindu',
    fields: [
      { name: 'caste', label: 'Caste', type: 'text', required: false },
      { name: 'subCaste', label: 'Sub-Caste', type: 'text', required: false },
      { name: 'gotra', label: 'Gotra', type: 'text', required: false },
      { name: 'rashi', label: 'Rashi (Moon Sign)', type: 'select', required: false, options: [
        'Aries (Mesh)', 'Taurus (Vrishabh)', 'Gemini (Mithun)', 'Cancer (Kark)',
        'Leo (Simha)', 'Virgo (Kanya)', 'Libra (Tula)', 'Scorpio (Vrishchik)',
        'Sagittarius (Dhanu)', 'Capricorn (Makar)', 'Aquarius (Kumbh)', 'Pisces (Meen)'
      ]},
      { name: 'nakshatra', label: 'Nakshatra (Birth Star)', type: 'text', required: false },
      { name: 'manglik', label: 'Manglik Status', type: 'select', required: false, options: [
        'Yes', 'No', 'Anshik (Partial)', 'Doesn\'t Matter'
      ]},
      { name: 'deity', label: 'Kul Devta/Devi', type: 'text', required: false }
    ]
  },
  muslim: {
    name: 'Muslim',
    fields: [
      { name: 'sect', label: 'Sect', type: 'select', required: false, options: [
        'Sunni', 'Shia', 'Ahmadiyya', 'Other'
      ]},
      { name: 'community', label: 'Community', type: 'text', required: false },
      { name: 'maslak', label: 'Maslak/School of Thought', type: 'select', required: false, options: [
        'Hanafi', 'Maliki', 'Shafi\'i', 'Hanbali', 'Ja\'fari', 'Other'
      ]},
      { name: 'namazPractice', label: 'Namaz Practice', type: 'select', required: false, options: [
        'Regular (5 times)', 'Often', 'Sometimes', 'On Special Occasions'
      ]},
      { name: 'hijab', label: 'Hijab/Purdah', type: 'select', required: false, options: [
        'Yes', 'No', 'Partially', 'Prefer not to say'
      ]},
      { name: 'arabicName', label: 'Arabic Name (if different)', type: 'text', required: false }
    ]
  },
  christian: {
    name: 'Christian',
    fields: [
      { name: 'denomination', label: 'Denomination', type: 'select', required: false, options: [
        'Catholic', 'Protestant', 'Orthodox', 'Anglican', 'Pentecostal',
        'Baptist', 'Methodist', 'Lutheran', 'Other'
      ]},
      { name: 'churchAffiliation', label: 'Church Affiliation', type: 'text', required: false },
      { name: 'baptized', label: 'Baptized', type: 'select', required: false, options: [
        'Yes', 'No', 'Planning to'
      ]},
      { name: 'sundayService', label: 'Church Attendance', type: 'select', required: false, options: [
        'Weekly', 'Monthly', 'Occasionally', 'On Special Occasions'
      ]},
      { name: 'communityService', label: 'Community Service', type: 'select', required: false, options: [
        'Active', 'Occasional', 'None'
      ]},
      { name: 'biblicalName', label: 'Biblical/Confirmation Name', type: 'text', required: false }
    ]
  },
  sikh: {
    name: 'Sikh',
    fields: [
      { name: 'caste', label: 'Caste/Community', type: 'select', required: false, options: [
        'Jat', 'Khatri', 'Arora', 'Ramgarhia', 'Saini', 'Lubana', 'Ahluwalia',
        'Caste No Bar', 'Other'
      ]},
      { name: 'amritdhari', label: 'Amritdhari Status', type: 'select', required: false, options: [
        'Yes (Amritdhari)', 'No (Keshdhari)', 'Sehajdhari', 'Mona'
      ]},
      { name: 'gurdwaraAffiliation', label: 'Gurdwara Affiliation', type: 'text', required: false },
      { name: 'languageProficiency', label: 'Punjabi Proficiency', type: 'select', required: false, options: [
        'Fluent', 'Conversational', 'Basic', 'Learning'
      ]},
      { name: 'kirtan', label: 'Kirtan/Seva Participation', type: 'select', required: false, options: [
        'Active', 'Occasional', 'None'
      ]},
      { name: 'turban', label: 'Turban (for males)', type: 'select', required: false, options: [
        'Yes', 'No', 'Sometimes', 'N/A'
      ]}
    ]
  }
};

export const commonFields = [
  { name: 'fullName', label: 'Full Name', type: 'text', required: true },
  { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true },
  { name: 'timeOfBirth', label: 'Time of Birth', type: 'time', required: false },
  { name: 'placeOfBirth', label: 'Place of Birth', type: 'text', required: false, maxLength: 26 },
  { name: 'height', label: 'Height', type: 'select', required: false, options: generateHeightOptions() },
  { name: 'weight', label: 'Weight', type: 'text', required: false, placeholder: 'e.g., 65 kg', maxLength: 26 },
  { name: 'complexion', label: 'Complexion', type: 'select', required: false, options: [
    'Fair', 'Wheatish', 'Dusky', 'Dark'
  ]},
  { name: 'bloodGroup', label: 'Blood Group', type: 'select', required: false, options: [
    'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Don\'t Know'
  ]},
  { name: 'maritalStatus', label: 'Marital Status', type: 'select', required: false, options: [
    'Never Married', 'Divorced', 'Widowed', 'Separated'
  ]},
  { name: 'education', label: 'Highest Education', type: 'text', required: false },
  { name: 'college', label: 'College/University', type: 'text', required: false },
  { name: 'occupation', label: 'Occupation', type: 'text', required: false },
  { name: 'company', label: 'Company Name', type: 'text', required: false },
  { name: 'annualIncome', label: 'Annual Income', type: 'text', required: false },
  { name: 'workLocation', label: 'Work Location', type: 'text', required: false }
];

export const familyFields = [
  { name: 'fatherName', label: "Father's Name", type: 'text', required: false },
  { name: 'fatherOccupation', label: "Father's Occupation", type: 'text', required: false },
  { name: 'motherName', label: "Mother's Name", type: 'text', required: false },
  { name: 'motherOccupation', label: "Mother's Occupation", type: 'text', required: false },
  { name: 'siblings', label: 'Number of Siblings', type: 'text', required: false },
  { name: 'siblingsMarried', label: 'Siblings Married', type: 'text', required: false },
  { name: 'familyType', label: 'Family Type', type: 'select', required: false, options: [
    'Nuclear', 'Joint', 'Extended'
  ]},
  { name: 'familyValues', label: 'Family Values', type: 'select', required: false, options: [
    'Traditional', 'Moderate', 'Liberal'
  ]},
  { name: 'familyIncome', label: 'Family Income', type: 'select', required: false, options: [
    'Lower Middle Class', 'Middle Class', 'Upper Middle Class', 'Rich', 'Affluent'
  ]},
  { name: 'nativePlace', label: 'Native Place', type: 'text', required: false },
  { name: 'currentAddress', label: 'Current Address', type: 'textarea', required: false }
];

export const contactFields = [
  { name: 'phone', label: 'Phone Number', type: 'tel', required: true },
  { name: 'email', label: 'Email Address', type: 'email', required: false },
  { name: 'whatsapp', label: 'Alternate Number', type: 'tel', required: false },
  { name: 'address', label: 'Contact Address', type: 'textarea', required: false }
];

export const preferencesFields = [
  { name: 'partnerAgeRange', label: 'Partner Age Range', type: 'text', required: false, placeholder: 'e.g., 25-30' },
  { name: 'partnerHeight', label: 'Partner Height Preference', type: 'text', required: false, placeholder: 'e.g., 5 ft 1 inch to 6 ft 1 inch' },
  { name: 'partnerEducation', label: 'Partner Education', type: 'text', required: false },
  { name: 'partnerOccupation', label: 'Partner Occupation', type: 'text', required: false },
  { name: 'partnerLocation', label: 'Partner Location', type: 'text', required: false },
  { name: 'otherPreferences', label: 'Other Preferences', type: 'textarea', required: false }
];

export const getReligionFields = (religion: string) => {
  return (religionSpecificFields as any)[religion] || { name: 'Unknown', fields: [] };
};
