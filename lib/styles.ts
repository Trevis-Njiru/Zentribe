/*
  Shared Zentribe surface styles.
  Existing exports (primaryButton, card) keep their names so current pages
  keep working; they now press, release on a spring, and show a focus ring.
*/

const base =
  'zt-press inline-flex items-center justify-center gap-2 rounded-full font-semibold select-none disabled:pointer-events-none disabled:opacity-50'

const primaryLook =
  'bg-teal-700 text-white shadow-[0_1px_2px_rgb(11_127_139/0.35),0_8px_20px_-8px_rgb(11_127_139/0.55)] hover:bg-teal-800'

const secondaryLook =
  'border border-stone-300 bg-white/60 text-stone-800 hover:border-stone-400 hover:bg-white'

const ghostLook =
  'border border-teal-700/70 text-teal-800 hover:bg-teal-50'

// Default size (matches the old primaryButton dimensions)
export const primaryButton = [base, primaryLook, 'px-6 py-3'].join(' ')
export const secondaryButton = [base, secondaryLook, 'px-6 py-3'].join(' ')

// Large: hero actions
export const primaryButtonLg = [base, primaryLook, 'px-8 py-4 text-base'].join(' ')
export const secondaryButtonLg = [base, secondaryLook, 'px-8 py-4 text-base'].join(' ')

// Small: navigation bar (44px tall touch target)
export const primaryButtonSm = [base, primaryLook, 'min-h-11 px-5 text-sm'].join(' ')
export const ghostButtonSm = [base, ghostLook, 'min-h-11 px-5 text-sm'].join(' ')
export const neutralButtonSm = [base, secondaryLook, 'min-h-11 px-5 text-sm'].join(' ')

// Surfaces
export const card = 'rounded-3xl bg-white p-8 shadow-sm'
export const cardInteractive =
  'zt-card-hover rounded-3xl bg-white p-8 ring-1 ring-stone-200/80 shadow-sm'