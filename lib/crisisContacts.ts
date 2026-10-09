/*
  Crisis contacts shown on /crisis.

  IMPORTANT: re-verify these before launch and every few months. Helplines
  change hours and numbers. Last cross-checked against several published
  sources in October 2026. Where sources disagreed (for example the
  0800 723 253 line, and 1190), the number was left out on purpose.
  Befrienders Kenya's own site is the best place to confirm its hours.
*/

export type CrisisContact = {
  id: string
  name: string
  description: string
  display: string // how the number is shown
  tel: string // what the phone dials (tel: link)
  note?: string
}

// Immediate danger: police, ambulance, fire.
export const emergencyNumbers: CrisisContact[] = [
  {
    id: 'emergency-999',
    name: 'Emergency services',
    description: 'Police and emergency response',
    display: '999',
    tel: '999',
  },
  {
    id: 'emergency-112',
    name: 'Emergency services',
    description: 'Works from any mobile phone',
    display: '112',
    tel: '112',
  },
]

// Talk to someone now.
export const supportLines: CrisisContact[] = [
  {
    id: 'kenya-red-cross',
    name: 'Kenya Red Cross',
    description: 'Free counselling and mental health support, any time of day.',
    display: '1199',
    tel: '1199',
    note: 'Free to call from Safaricom. Open 24 hours.',
  },
  {
    id: 'befrienders',
    name: 'Befrienders Kenya',
    description: 'Emotional support and suicide prevention, from trained volunteers.',
    display: '+254 722 178 177',
    tel: '+254722178177',
    note: 'Hours can vary. If nobody answers, call 1199.',
  },
]

// For specific situations.
export const specialistLines: CrisisContact[] = [
  {
    id: 'childline',
    name: 'Childline Kenya',
    description: 'For anyone under 18 who needs help or feels unsafe.',
    display: '116',
    tel: '116',
    note: 'Free, 24 hours.',
  },
  {
    id: 'gbv',
    name: 'Gender-based violence helpline',
    description: 'If someone is hurting you, or you are afraid of someone.',
    display: '1195',
    tel: '1195',
  },
]