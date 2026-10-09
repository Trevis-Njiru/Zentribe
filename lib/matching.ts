export type StyleScores = {
  action: number
  relational: number
  creative: number
}

export type Professional = {
  id: string
  full_name: string
  professional_type: string | null
  specializations: string[] | null
  languages: string[] | null
  session_types: string[] | null
  availability: string[] | null
  location: string | null
  bio: string | null
  verification_status: string | null
  care_types: string[] | null
  gender: string | null
  age_group: string | null
  style_action: number | null
  style_relational: number | null
  style_creative: number | null
  photo_url: string | null
  verification_checks: string[] | null
  verified_at: string | null
}

export type Answers = {
  care_type: string | null
  county: string | null
  availability_slots: string[]
  start_timing: string | null
  style_scores: StyleScores | null
  focus_areas: string[]
  gender_pref: string | null
  age_pref: string | null
  priorities: string[]
}

export type FactorKey =
  | 'care'
  | 'focus'
  | 'style'
  | 'gender'
  | 'age'
  | 'county'
  | 'availability'

export type BreakdownItem = {
  key: FactorKey
  label: string
  earned: number
  max: number
}

export type MatchResult = {
  professional: Professional
  score: number
  reasons: string[]
  breakdown: BreakdownItem[]
  matchedFocus: string[]
  careFits: boolean
}

export const careLabels: Record<string, string> = {
  individual: 'Individual',
  child: 'Child (under 10)',
  family: 'Family',
  couple: 'Couple',
  adolescent: 'Adolescent (10-18)',
}

export const genderLabels: Record<string, string> = {
  no_preference: 'No preference',
  woman: 'Woman',
  man: 'Man',
  non_binary: 'Non-binary',
}

export const ageLabels: Record<string, string> = {
  no_preference: 'No preference',
  under_35: 'Under 35',
  '35_to_50': '35 to 50',
  over_50: 'Over 50',
}

export const timingLabels: Record<string, string> = {
  asap: 'As soon as possible',
  within_month: 'Within a month',
  not_sure: 'Not sure',
}

export const factorLabels: Record<FactorKey, string> = {
  care: 'Type of care',
  focus: 'Expertise',
  style: 'Style',
  gender: 'Gender',
  age: 'Age',
  county: 'Location',
  availability: 'Availability',
}

export const verificationChecks: {
  key: string
  title: string
  detail: string
}[] = [
  {
    key: 'identity',
    title: 'Identity confirmed',
    detail: 'Zentribe checked an official form of identification.',
  },
  {
    key: 'credentials',
    title: 'Qualifications checked',
    detail: 'Zentribe reviewed their training and professional registration.',
  },
  {
    key: 'background',
    title: 'Background check completed',
    detail: 'A background check was completed for this professional.',
  },
]

export function isVerified(p: Professional) {
  const checks = p.verification_checks ?? []

  return checks.includes('identity') && checks.includes('credentials')
}

const ALL_SLOTS = [
  'weekdays_before_9am',
  'weekdays_9am_5pm',
  'weekdays_after_5pm',
  'weekends_9am_5pm',
  'weekends_after_5pm',
]

const availabilityToSlots: Record<string, string[]> = {
  morning: ['weekdays_before_9am', 'weekdays_9am_5pm'],
  afternoon: ['weekdays_9am_5pm'],
  evening: ['weekdays_after_5pm'],
  weekdays: [
    'weekdays_before_9am',
    'weekdays_9am_5pm',
    'weekdays_after_5pm',
  ],
  weekends: ['weekends_9am_5pm', 'weekends_after_5pm'],
  flexible: ALL_SLOTS,
}

const weekdayOrder = [
  'weekdays_before_9am',
  'weekdays_9am_5pm',
  'weekdays_after_5pm',
]

const weekendOrder = ['weekends_9am_5pm', 'weekends_after_5pm']

const slotText: Record<string, string> = {
  weekdays_before_9am: 'before 9am',
  weekdays_9am_5pm: '9am-5pm',
  weekdays_after_5pm: 'after 5pm',
  weekends_9am_5pm: '9am-5pm',
  weekends_after_5pm: 'after 5pm',
}

const focusAliases: Record<string, string> = {
  grief: 'grief and loss',
  loss: 'grief and loss',
  family: 'family dynamics',
  relationships: 'relationship issues',
  relationship: 'relationship issues',
  addiction: 'addiction and substance use',
  'substance use': 'addiction and substance use',
  work: 'career-related stress',
  career: 'career-related stress',
  youth: 'youth issues',
  'self esteem': 'self-esteem',
  'eating disorders': 'eating disorder',
  adhd: 'add/adhd',
}

const priorityFactor: Record<string, FactorKey> = {
  Age: 'age',
  'Expertise or speciality': 'focus',
  Gender: 'gender',
  'Style or personality': 'style',
}

const RANK_WEIGHTS = [28, 20, 13, 7]
const FIXED_WEIGHTS = { care: 8, county: 12, availability: 12 }
const DEFAULT_PRIORITY_ORDER: FactorKey[] = [
  'focus',
  'style',
  'gender',
  'age',
]
const ageOrder = ['under_35', '35_to_50', 'over_50']

function lower(value: string | null | undefined) {
  return (value ?? '').trim().toLowerCase()
}

function canonical(value: string) {
  const key = lower(value)
  return focusAliases[key] ?? key
}

function listWords(items: string[]) {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

export function firstNameOf(fullName: string) {
  return fullName.replace(/^dr\.?\s+/i, '').split(' ')[0]
}

export function offersOnline(p: Professional) {
  const online = ['video', 'video call', 'chat', 'online', 'phone call', 'phone']

  return (
    lower(p.location) === 'online' ||
    (p.session_types ?? []).some((type) => online.includes(lower(type)))
  )
}

export function offersInPerson(p: Professional) {
  return (p.session_types ?? []).some((type) =>
    ['in-person', 'in person'].includes(lower(type))
  )
}

export function methodSummary(p: Professional) {
  const methods: string[] = []

  if (offersOnline(p)) methods.push('Virtual')
  if (offersInPerson(p)) methods.push('In-person')

  return methods
}

export function professionalSlots(p: Professional) {
  const slots = new Set<string>()

  ;(p.availability ?? []).forEach((entry) => {
    const key = lower(entry)

    if (ALL_SLOTS.includes(key)) {
      slots.add(key)
      return
    }

    ;(availabilityToSlots[key] ?? []).forEach((slot) => slots.add(slot))
  })

  return Array.from(slots)
}

export function describeAvailability(slots: string[]) {
  if (slots.includes('flexible')) return ['Flexible']

  const lines: string[] = []

  const weekdays = weekdayOrder
    .filter((slot) => slots.includes(slot))
    .map((slot) => slotText[slot])

  const weekends = weekendOrder
    .filter((slot) => slots.includes(slot))
    .map((slot) => slotText[slot])

  if (weekdays.length) lines.push(`Weekdays: ${weekdays.join(', ')}`)
  if (weekends.length) lines.push(`Weekends: ${weekends.join(', ')}`)

  return lines
}

function tagsFromScores(
  action: number | null,
  relational: number | null,
  creative: number | null
) {
  const entries = [
    { label: 'Action oriented', value: action },
    { label: 'Relational and reflective', value: relational },
    { label: 'Creative and integrative', value: creative },
  ].filter((entry) => entry.value !== null) as {
    label: string
    value: number
  }[]

  if (entries.length === 0) return []

  const strong = entries
    .filter((entry) => entry.value >= 50)
    .sort((a, b) => b.value - a.value)

  if (strong.length > 0) return strong.map((entry) => entry.label)

  return [entries.sort((a, b) => b.value - a.value)[0].label]
}

export function styleTags(p: Professional) {
  return tagsFromScores(p.style_action, p.style_relational, p.style_creative)
}

export function memberStyleTags(scores: StyleScores | null) {
  if (!scores) return []
  return tagsFromScores(scores.action, scores.relational, scores.creative)
}

function weightsFor(priorities: string[]) {
  const order: FactorKey[] = []

  priorities.forEach((label) => {
    const factor = priorityFactor[label]
    if (factor && !order.includes(factor)) order.push(factor)
  })

  DEFAULT_PRIORITY_ORDER.forEach((factor) => {
    if (!order.includes(factor)) order.push(factor)
  })

  const weights = { ...FIXED_WEIGHTS } as Record<FactorKey, number>

  order.slice(0, 4).forEach((factor, index) => {
    weights[factor] = RANK_WEIGHTS[index]
  })

  return weights
}

export function scoreProfessional(
  p: Professional,
  answers: Answers
): MatchResult {
  const weights = weightsFor(answers.priorities)
  const reasons: string[] = []

  const fractions: Record<FactorKey, number> = {
    care: 0,
    focus: 0,
    style: 0,
    gender: 0,
    age: 0,
    county: 0,
    availability: 0,
  }

  const careTypes = p.care_types ?? []
  const careFits = !answers.care_type || careTypes.includes(answers.care_type)

  fractions.care = careFits ? 1 : 0

  if (answers.care_type && careFits) {
    reasons.push(
      `Offers ${careLabels[answers.care_type] ?? answers.care_type} care`
    )
  }

  const therapistAreas = new Set((p.specializations ?? []).map(canonical))

  const matchedFocus = answers.focus_areas.filter((area) =>
    therapistAreas.has(canonical(area))
  )

  fractions.focus =
    answers.focus_areas.length === 0
      ? 0.5
      : matchedFocus.length / answers.focus_areas.length

  if (matchedFocus.length > 0) {
    reasons.push(`Expertise in ${listWords(matchedFocus)}`)
  }

  if (
    !answers.style_scores ||
    p.style_action === null ||
    p.style_relational === null ||
    p.style_creative === null
  ) {
    fractions.style = 0.5
  } else {
    const difference =
      Math.abs(answers.style_scores.action - p.style_action) +
      Math.abs(answers.style_scores.relational - p.style_relational) +
      Math.abs(answers.style_scores.creative - p.style_creative)

    fractions.style = Math.max(0, 1 - difference / 220)

    if (fractions.style >= 0.8) {
      reasons.push('Their style closely matches what you chose')
    } else if (fractions.style >= 0.65) {
      reasons.push('Their style is a good fit for you')
    }
  }

  const genderPref = answers.gender_pref

  if (!genderPref || genderPref === 'no_preference') {
    fractions.gender = 1
  } else if (!p.gender) {
    fractions.gender = 0.5
  } else if (p.gender === genderPref) {
    fractions.gender = 1
    reasons.push(`${genderLabels[genderPref]} provider, as you preferred`)
  }

  const agePref = answers.age_pref

  if (!agePref || agePref === 'no_preference') {
    fractions.age = 1
  } else if (!p.age_group) {
    fractions.age = 0.5
  } else {
    const gap = Math.abs(
      ageOrder.indexOf(agePref) - ageOrder.indexOf(p.age_group)
    )

    fractions.age = gap === 0 ? 1 : gap === 1 ? 0.4 : 0

    if (gap === 0) {
      reasons.push(`In your preferred age range (${ageLabels[agePref]})`)
    }
  }

  if (!answers.county) {
    fractions.county = 0.5
  } else if (lower(p.location) === lower(answers.county)) {
    fractions.county = 1
    reasons.push(`Based in ${answers.county}`)
  } else if (offersOnline(p)) {
    fractions.county = 0.6
    reasons.push('Offers online sessions')
  }

  const memberSlots = answers.availability_slots.filter(
    (slot) => slot !== 'flexible'
  )

  const slots = professionalSlots(p)

  if (answers.availability_slots.length === 0 || slots.length === 0) {
    fractions.availability = 0.5
  } else if (
    answers.availability_slots.includes('flexible') ||
    memberSlots.length === 0
  ) {
    fractions.availability = 1
    reasons.push('Has openings that suit your flexible schedule')
  } else {
    const overlap = memberSlots.filter((slot) => slots.includes(slot)).length

    fractions.availability = overlap / memberSlots.length

    if (overlap > 0) reasons.push('Available at times that suit you')
  }

  const breakdown: BreakdownItem[] = (
    Object.keys(fractions) as FactorKey[]
  ).map((key) => ({
    key,
    label: factorLabels[key],
    earned: Math.round(weights[key] * fractions[key] * 10) / 10,
    max: weights[key],
  }))

  const total = breakdown.reduce((sum, item) => sum + item.earned, 0)

  return {
    professional: p,
    score: Math.max(0, Math.min(100, Math.round(total))),
    reasons,
    breakdown,
    matchedFocus,
    careFits,
  }
}

export function rankProfessionals(
  professionals: Professional[],
  answers: Answers
) {
  const scored = professionals.map((p) => scoreProfessional(p, answers))
  const fitting = scored.filter((result) => result.careFits)
  const pool = fitting.length > 0 ? fitting : scored

  const results = [...pool].sort(
    (a, b) =>
      b.score - a.score ||
      a.professional.full_name.localeCompare(b.professional.full_name)
  )

  return {
    results,
    careFallback: fitting.length === 0 && scored.length > 0,
  }
}

function parseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback

  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function isStyleScores(value: unknown): value is StyleScores {
  if (!value || typeof value !== 'object') return false

  const v = value as Record<string, unknown>

  return (
    typeof v.action === 'number' &&
    typeof v.relational === 'number' &&
    typeof v.creative === 'number'
  )
}

const flowKeys = [
  'zentribe_care_type',
  'zentribe_county',
  'zentribe_availability',
  'zentribe_start_timing',
  'zentribe_style',
  'zentribe_focus_areas',
  'zentribe_gender_pref',
  'zentribe_age_pref',
  'zentribe_priorities',
]

export function readFlowAnswers(): Answers | null {
  if (typeof window === 'undefined') return null

  try {
    const store = window.sessionStorage
    const care = store.getItem('zentribe_care_type')
    const focus = parseJson<string[]>(store.getItem('zentribe_focus_areas'), [])

    if (!care && focus.length === 0) return null

    const style = parseJson<unknown>(store.getItem('zentribe_style'), null)

    return {
      care_type: care,
      county: store.getItem('zentribe_county'),
      availability_slots: parseJson<string[]>(
        store.getItem('zentribe_availability'),
        []
      ),
      start_timing: store.getItem('zentribe_start_timing'),
      style_scores: isStyleScores(style) ? style : null,
      focus_areas: focus,
      gender_pref: store.getItem('zentribe_gender_pref'),
      age_pref: store.getItem('zentribe_age_pref'),
      priorities: parseJson<string[]>(store.getItem('zentribe_priorities'), []),
    }
  } catch {
    return null
  }
}

export function clearFlowAnswers() {
  try {
    flowKeys.forEach((key) => window.sessionStorage.removeItem(key))
  } catch {
    // Nothing to clear.
  }
}

const PENDING_KEY = 'zentribe_pending_answers'

export function savePendingAnswers(answers: Answers) {
  try {
    window.localStorage.setItem(PENDING_KEY, JSON.stringify(answers))
  } catch {
    // Saving is optional.
  }
}

export function readPendingAnswers(): Answers | null {
  try {
    return parseJson<Answers | null>(
      window.localStorage.getItem(PENDING_KEY),
      null
    )
  } catch {
    return null
  }
}

export function clearPendingAnswers() {
  try {
    window.localStorage.removeItem(PENDING_KEY)
  } catch {
    // Nothing to clear.
  }
}

export function answersFromRow(
  row: Record<string, unknown> | null
): Answers | null {
  if (!row) return null

  const careType = typeof row.care_type === 'string' ? row.care_type : null

  const focus = Array.isArray(row.focus_areas)
    ? (row.focus_areas as string[])
    : []

  if (!careType && focus.length === 0) return null

  return {
    care_type: careType,
    county: typeof row.county === 'string' ? row.county : null,
    availability_slots: Array.isArray(row.availability_slots)
      ? (row.availability_slots as string[])
      : [],
    start_timing:
      typeof row.start_timing === 'string' ? row.start_timing : null,
    style_scores: isStyleScores(row.style_scores) ? row.style_scores : null,
    focus_areas: focus,
    gender_pref: typeof row.gender_pref === 'string' ? row.gender_pref : null,
    age_pref: typeof row.age_pref === 'string' ? row.age_pref : null,
    priorities: Array.isArray(row.priorities)
      ? (row.priorities as string[])
      : [],
  }
}

export function rowFromAnswers(answers: Answers) {
  return {
    care_type: answers.care_type,
    county: answers.county,
    availability_slots: answers.availability_slots,
    start_timing: answers.start_timing,
    style_scores: answers.style_scores,
    focus_areas: answers.focus_areas,
    gender_pref: answers.gender_pref,
    age_pref: answers.age_pref,
    priorities: answers.priorities,
  }
}