export interface FieldDef {
  key: string;
  label: string;
}

export interface FieldSection {
  title: string;
  fields: FieldDef[];
}

export const FIELD_SECTIONS: FieldSection[] = [
  {
    title: 'Personal Details',
    fields: [
      { key: 'dateOfBirth', label: 'Date of Birth:' },
      { key: 'gender', label: 'Gender:' },
      { key: 'timeOfBirth', label: 'Time of Birth:' },
      { key: 'placeOfBirth', label: 'Place of Birth:' },
      { key: 'height', label: 'Height:' },
      { key: 'weight', label: 'Weight:' },
      { key: 'complexion', label: 'Complexion:' },
      { key: 'bloodGroup', label: 'Blood Group:' },
      { key: 'maritalStatus', label: 'Marital Status:' },
      { key: 'education', label: 'Education:' },
      { key: 'college', label: 'College/University:' },
      { key: 'occupation', label: 'Occupation:' },
      { key: 'company', label: 'Company:' },
      { key: 'annualIncome', label: 'Annual Income:' },
      { key: 'workLocation', label: 'Work Location:' },
    ],
  },
  {
    title: 'Religion Details',
    fields: [
      { key: 'caste', label: 'Caste:' },
      { key: 'subCaste', label: 'Sub-Caste:' },
      { key: 'gotra', label: 'Gotra:' },
      { key: 'rashi', label: 'Rashi:' },
      { key: 'nakshatra', label: 'Nakshatra:' },
      { key: 'manglik', label: 'Manglik:' },
      { key: 'deity', label: 'Kul Devta/Devi:' },
      { key: 'sect', label: 'Sect:' },
      { key: 'community', label: 'Community:' },
      { key: 'maslak', label: 'Maslak:' },
      { key: 'namazPractice', label: 'Namaz Practice:' },
      { key: 'hijab', label: 'Hijab/Purdah:' },
      { key: 'arabicName', label: 'Arabic Name:' },
      { key: 'denomination', label: 'Denomination:' },
      { key: 'churchAffiliation', label: 'Church:' },
      { key: 'baptized', label: 'Baptized:' },
      { key: 'sundayService', label: 'Church Attendance:' },
      { key: 'jatha', label: 'Jatha:' },
      { key: 'amritdhari', label: 'Amritdhari:' },
      { key: 'keshdhari', label: 'Keshdhari:' },
      { key: 'gurudwaraVisit', label: 'Gurudwara Visit:' },
    ],
  },
  {
    title: 'Family Information',
    fields: [
      { key: 'fatherName', label: "Father's Name:" },
      { key: 'fatherOccupation', label: "Father's Occupation:" },
      { key: 'motherName', label: "Mother's Name:" },
      { key: 'motherOccupation', label: "Mother's Occupation:" },
      { key: 'siblings', label: 'Siblings:' },
      { key: 'siblingsMarried', label: 'Siblings Married:' },
      { key: 'familyType', label: 'Family Type:' },
      { key: 'familyValues', label: 'Family Values:' },
      { key: 'familyIncome', label: 'Family Income:' },
      { key: 'nativePlace', label: 'Native Place:' },
      { key: 'currentAddress', label: 'Current Address:' },
    ],
  },
  {
    title: 'Contact Information',
    fields: [
      { key: 'phone', label: 'Phone:' },
      { key: 'email', label: 'Email:' },
      { key: 'whatsapp', label: 'Alternate No:' },
      { key: 'address', label: 'Address:' },
    ],
  },
  {
    title: 'Partner Preferences',
    fields: [
      { key: 'partnerAgeRange', label: 'Partner Age Range:' },
      { key: 'partnerHeight', label: 'Partner Height:' },
      { key: 'partnerEducation', label: 'Partner Education:' },
      { key: 'partnerOccupation', label: 'Partner Occupation:' },
      { key: 'partnerLocation', label: 'Partner Location:' },
      { key: 'otherPreferences', label: 'Other Preferences:' },
    ],
  },
];
