// ==============================================================================
// Z-EXAM: MASTER SRI LANKAN CURRICULUM ARCHITECTURE
// Grade 10, Grade 11 (O/L), and A/L Structure
// ==============================================================================

export const GRADES = [
  { id: 'all', name: 'All Grades', label: 'All Papers' },
  { id: 'grade10', name: 'Grade 10', label: 'Grade 10' },
  { id: 'grade11', name: 'Grade 11', label: 'Grade 11 (O/L)' },
  { id: 'al', name: 'A/L', label: 'G.C.E. A/L' }
];

export const OL_BASKETS = [
  { id: 'all', name: 'All Categories' },
  { id: 'core', name: 'Core (6 Subjects)', label: 'Core Compulsory' },
  { id: 'set1', name: 'Set 1 (Basket 1)', label: 'Commerce / Geo / Civics' },
  { id: 'set2', name: 'Set 2 (Basket 2)', label: 'Aesthetics & Literature' },
  { id: 'set3', name: 'Set 3 (Basket 3)', label: 'ICT & Technology' }
];

// Compulsory Core Subjects for Grade 10 & 11
export const CORE_SUBJECTS = [
  {
    id: 'tamil',
    name: 'Tamil',
    fullName: 'Tamil Language & Literature',
    tamilName: 'தமிழ் மொழி & இலக்கியம்',
    icon: 'BookOpen',
    group: 'core',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
  },
  {
    id: 'english',
    name: 'English',
    fullName: 'English Language',
    tamilName: 'ஆங்கில மொழி',
    icon: 'Languages',
    group: 'core',
    badgeBg: 'bg-sky-500/10 text-sky-400 border-sky-500/30'
  },
  {
    id: 'maths',
    name: 'Maths',
    fullName: 'Mathematics',
    tamilName: 'கணிதம்',
    icon: 'Calculator',
    group: 'core',
    badgeBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
  },
  {
    id: 'science',
    name: 'Science',
    fullName: 'Science & Technology',
    tamilName: 'விஞ்ஞானம்',
    icon: 'Atom',
    group: 'core',
    badgeBg: 'bg-violet-500/10 text-violet-400 border-violet-500/30'
  },
  {
    id: 'history',
    name: 'History',
    fullName: 'Sri Lankan & World History',
    tamilName: 'வரலாறு',
    icon: 'Landmark',
    group: 'core',
    badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30'
  },
  {
    id: 'religion',
    name: 'Religion',
    fullName: 'Religious Studies',
    tamilName: 'சமயக் கல்வி',
    icon: 'Flame',
    group: 'core',
    badgeBg: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    hasStreams: true,
    streams: [
      { id: 'hinduism', name: 'Hinduism', tamilName: 'சைவநெறி / இந்து சமயம்', badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
      { id: 'christianity_rc', name: 'Christianity (RC)', tamilName: 'கிறிஸ்தவம் (கத்தோலிக்கம்)', badgeBg: 'bg-sky-500/10 text-sky-400 border-sky-500/30' },
      { id: 'christianity_non_rc', name: 'Christianity (Non-RC)', tamilName: 'கிறிஸ்தவம்', badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30' }
    ]
  }
];

// Set 1 (Basket 1 - Humanities & Social Sciences)
export const SET1_SUBJECTS = [
  {
    id: 'commerce',
    name: 'Commerce',
    fullName: 'Business & Accounting Studies',
    tamilName: 'வணிகக் கல்வி & கணக்கீடு',
    icon: 'TrendingUp',
    group: 'set1',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
  },
  {
    id: 'geography',
    name: 'Geography',
    fullName: 'Geography',
    tamilName: 'புவியியல்',
    icon: 'Globe',
    group: 'set1',
    badgeBg: 'bg-teal-500/10 text-teal-400 border-teal-500/30'
  },
  {
    id: 'civics',
    name: 'Civics',
    fullName: 'Citizenship Education & Governance',
    tamilName: 'குடியியல் கல்வி',
    icon: 'Scale',
    group: 'set1',
    badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
  }
];

// Set 2 (Basket 2 - Aesthetics & Literature)
export const SET2_SUBJECTS = [
  {
    id: 'music',
    name: 'Music',
    fullName: 'Music (Carnatic / Oriental / Western)',
    tamilName: 'இசை',
    icon: 'Music',
    group: 'set2',
    badgeBg: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30'
  },
  {
    id: 'drama',
    name: 'Drama',
    fullName: 'Drama & Theatre',
    tamilName: 'நாடகமும் அரங்கியலும்',
    icon: 'Sparkles',
    group: 'set2',
    badgeBg: 'bg-pink-500/10 text-pink-400 border-pink-500/30'
  },
  {
    id: 'art',
    name: 'Art',
    fullName: 'Art & Drawing',
    tamilName: 'சித்திரம்',
    icon: 'Palette',
    group: 'set2',
    badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
  },
  {
    id: 'tamillit',
    name: 'Tamil Lit',
    fullName: 'Appreciation of Tamil Literary Texts',
    tamilName: 'தமிழ் இலக்கிய நயம்',
    icon: 'BookMarked',
    group: 'set2',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
  },
  {
    id: 'englishlit',
    name: 'English Lit',
    fullName: 'Appreciation of English Literary Texts',
    tamilName: 'ஆங்கில இலக்கிய நயம்',
    icon: 'BookOpen',
    group: 'set2',
    badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
  },
  {
    id: 'dance',
    name: 'Dance',
    fullName: 'Traditional Dance & Bharatanatyam',
    tamilName: 'நடனம்',
    icon: 'Activity',
    group: 'set2',
    badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30'
  }
];

// Set 3 (Basket 3 - Technology & Practical Skills)
export const SET3_SUBJECTS = [
  {
    id: 'ict',
    name: 'ICT',
    fullName: 'Information & Communication Technology',
    tamilName: 'தகவல் தொடர்பாடல் தொழினுட்பம்',
    icon: 'Laptop',
    group: 'set3',
    badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
  },
  {
    id: 'pt',
    name: 'PT',
    fullName: 'Practical Technical Skills',
    tamilName: 'செய்முறைத் தொழினுட்பக் கல்வி',
    icon: 'Wrench',
    group: 'set3',
    badgeBg: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
  },
  {
    id: 'agricultural',
    name: 'Agricultural',
    fullName: 'Agriculture & Food Technology',
    tamilName: 'விவசாய விஞ்ஞானம்',
    icon: 'Sprout',
    group: 'set3',
    badgeBg: 'bg-green-500/10 text-green-400 border-green-500/30'
  },
  {
    id: 'dt',
    name: 'DT',
    fullName: 'Design & Technology',
    tamilName: 'வடிவமைப்புத் தொழினுட்பம்',
    icon: 'PenTool',
    group: 'set3',
    badgeBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
  },
  {
    id: 'home_economics',
    name: 'Home Economics',
    fullName: 'Home Economics',
    tamilName: 'மனைப்பொருளியல்',
    icon: 'Home',
    group: 'set3',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
  }
];

// Combined O/L Subjects List
export const ALL_OL_SUBJECTS = [
  ...CORE_SUBJECTS,
  ...SET1_SUBJECTS,
  ...SET2_SUBJECTS,
  ...SET3_SUBJECTS
];

// G.C.E. Advanced Level (A/L) Subjects
export const AL_SUBJECTS = [
  {
    id: 'al_maths',
    name: 'Combined Maths',
    fullName: 'Combined Mathematics',
    tamilName: 'இணைந்த கணிதம்',
    icon: 'Calculator',
    group: 'al',
    badgeBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
  },
  {
    id: 'al_bio',
    name: 'Biology',
    fullName: 'Biology',
    tamilName: 'உயிரியல்',
    icon: 'Activity',
    group: 'al',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
  },
  {
    id: 'al_physics',
    name: 'Physics',
    fullName: 'Physics',
    tamilName: 'பௌதிகவியல்',
    icon: 'Atom',
    group: 'al',
    badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
  },
  {
    id: 'al_chemistry',
    name: 'Chemistry',
    fullName: 'Chemistry',
    tamilName: 'இரசாயனவியல்',
    icon: 'Atom',
    group: 'al',
    badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
  },
  {
    id: 'al_ict',
    name: 'A/L ICT',
    fullName: 'Information & Communication Technology (A/L)',
    tamilName: 'தகவல் தொடர்பாடல் தொழினுட்பம் (A/L)',
    icon: 'Laptop',
    group: 'al',
    badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
  },
  {
    id: 'al_econ',
    name: 'Economics',
    fullName: 'Economics',
    tamilName: 'பொருளியல்',
    icon: 'TrendingUp',
    group: 'al',
    badgeBg: 'bg-teal-500/10 text-teal-400 border-teal-500/30'
  },
  {
    id: 'al_business',
    name: 'Business',
    fullName: 'Business Studies',
    tamilName: 'வணிகக் கல்வி',
    icon: 'Briefcase',
    group: 'al',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
  },
  {
    id: 'al_accounts',
    name: 'Accounts',
    fullName: 'Accounting',
    tamilName: 'கணக்கீடு',
    icon: 'FileText',
    group: 'al',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
  },
  {
    id: 'al_arts',
    name: 'Arts',
    fullName: 'Arts Stream',
    tamilName: 'கலைப்பிரிவு',
    icon: 'BookOpen',
    group: 'al',
    badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30'
  }
];

// Master Subject Catalog (All combined for lookups)
export const MASTER_SUBJECTS = [
  ...ALL_OL_SUBJECTS,
  ...AL_SUBJECTS
];

// Helper to find any subject by id
export const findSubjectById = (id) => {
  if (!id) return null;
  const cleanId = id.toLowerCase();
  return MASTER_SUBJECTS.find((s) => s.id.toLowerCase() === cleanId) || {
    id: cleanId,
    name: cleanId.toUpperCase(),
    fullName: cleanId.toUpperCase(),
    tamilName: '',
    badgeBg: 'bg-slate-800 text-slate-300 border-slate-700'
  };
};

export const TERMS = [
  '3rd Term',
  '1st Term',
  '2nd Term',
  'Unit Exam',
  'Model Paper',
  'Past Paper',
  'Seminar Paper'
];

export const YEARS = [
  '2026',
  '2025',
  '2024',
  '2023',
  '2022',
  '2021',
  '2020'
];
