export const counties = [
  'Baringo',
  'Bomet',
  'Bungoma',
  'Busia',
  'Elgeyo-Marakwet',
  'Embu',
  'Garissa',
  'Homa Bay',
  'Isiolo',
  'Kajiado',
  'Kakamega',
  'Kericho',
  'Kiambu',
  'Kilifi',
  'Kirinyaga',
  'Kisii',
  'Kisumu',
  'Kitui',
  'Kwale',
  'Laikipia',
  'Lamu',
  'Machakos',
  'Makueni',
  'Mandera',
  'Marsabit',
  'Meru',
  'Migori',
  'Mombasa',
  "Murang'a",
  'Nairobi',
  'Nakuru',
  'Nandi',
  'Narok',
  'Nyamira',
  'Nyandarua',
  'Nyeri',
  'Samburu',
  'Siaya',
  'Taita-Taveta',
  'Tana River',
  'Tharaka-Nithi',
  'Trans Nzoia',
  'Turkana',
  'Uasin Gishu',
  'Vihiga',
  'Wajir',
  'West Pokot',
]

const commonFocusAreas = [
  'Anxiety',
  'Body Image',
  'Dating',
  'Depression',
  'Self-Esteem',
  'Trauma',
]

const otherFocusAreas = [
  'ADD/ADHD',
  'Addiction and Substance Use',
  'Adoption',
  'Aging Parents',
  'Anger',
  'Artist-Related Stress',
  'Bipolar Disorder',
  'Borderline Personality Disorder',
  'Burnout',
  'Career-Related Stress',
  'Chronic Illness',
  'Codependency',
  'Commitment Obstacles',
  'Creative Blocks',
  'Cultural Competence',
  'Divorce',
  'Domestic Violence',
  'Eating Disorder',
  'Ex-cult support',
  'Existential Crisis or Transition',
  'Family Dynamics',
  'Family Planning',
  'Fear of Failure',
  'Fertility',
  'Food-Related Stress',
  'Gambling/Crypto Addiction',
  'Gaslighting',
  'Gender Identity',
  'Grief and Loss',
  'Loneliness',
  'Panic Attacks',
  'Parenting',
  'Personal Growth',
  'Relationship Issues',
  'Sleep Problems',
  'Stress',
  'Youth Issues',
]

export const focusAreaOptions = [...commonFocusAreas, ...otherFocusAreas].sort(
  (a, b) => a.localeCompare(b)
)

export const careOptions = [
  { value: 'individual', label: 'Individual' },
  { value: 'child', label: 'Child (under 10)' },
  { value: 'family', label: 'Family' },
  { value: 'couple', label: 'Couple' },
  { value: 'adolescent', label: 'Adolescent (10-18)' },
]

export const professionalGenderOptions = [
  { value: 'woman', label: 'Woman' },
  { value: 'man', label: 'Man' },
  { value: 'non_binary', label: 'Non-binary' },
]

export const ageGroupOptions = [
  { value: 'under_35', label: 'Under 35' },
  { value: '35_to_50', label: '35 to 50' },
  { value: 'over_50', label: 'Over 50' },
]

export const languageOptions = [
  'English',
  'Kiswahili',
  'Sheng',
  'Kikuyu',
  'Luo',
  'Kalenjin',
  'Kamba',
  'Luhya',
  'Somali',
  'French',
]

export const sessionTypeOptions = ['In-person', 'Video', 'Chat', 'Phone call']

export const weekdaySlotOptions = [
  { value: 'weekdays_before_9am', label: 'Before 9am' },
  { value: 'weekdays_9am_5pm', label: '9am-5pm' },
  { value: 'weekdays_after_5pm', label: 'After 5pm' },
]

export const weekendSlotOptions = [
  { value: 'weekends_9am_5pm', label: '9am-5pm' },
  { value: 'weekends_after_5pm', label: 'After 5pm' },
]