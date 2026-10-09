'use client'

import { useId, useState } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'

/* Shared pieces for login, signup, forgot-password and reset-password. */

const inputClass = [
  'w-full rounded-2xl border border-stone-300 bg-white px-4 py-3.5',
  'text-base text-stone-900 placeholder:text-stone-400',
  'transition-[border-color,box-shadow] duration-200',
  'hover:border-stone-400',
  'focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-100',
  'aria-[invalid=true]:border-coral-500 aria-[invalid=true]:ring-coral-100',
].join(' ')

const submitClass = [
  'zt-press inline-flex w-full items-center justify-center gap-2 rounded-full',
  'bg-teal-700 py-3.5 text-base font-semibold text-white',
  'shadow-[0_1px_2px_rgb(11_127_139/0.35),0_8px_20px_-8px_rgb(11_127_139/0.55)]',
  'hover:bg-teal-800 disabled:pointer-events-none disabled:opacity-60',
].join(' ')

export const authLinkClass =
  'zt-press rounded font-semibold text-teal-700 hover:text-teal-900'

export function AuthPage({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <main className="flex flex-1 items-start justify-center bg-stone-50 px-5 pb-16 pt-8 md:items-center md:pt-4">
      <div className="zt-rise w-full max-w-md rounded-[2rem] bg-white p-7 shadow-[0_2px_4px_rgb(35_45_52/0.04),0_24px_56px_-24px_rgb(35_45_52/0.22)] ring-1 ring-stone-200/70 md:p-9">
        <div className="mb-8 text-center">
          <p className="zt-eyebrow mb-3 text-teal-700">Zentribe</p>

          <h1 className="zt-title text-3xl text-stone-900">{title}</h1>

          {subtitle && (
            <p className="zt-lead mt-3 text-sm text-stone-600">{subtitle}</p>
          )}
        </div>

        {children}

        {footer && (
          <div className="mt-8 space-y-3 border-t border-stone-200 pt-6 text-center text-sm text-stone-600">
            {footer}
          </div>
        )}
      </div>
    </main>
  )
}

export function Field({
  label,
  hint,
  invalid,
  ...props
}: {
  label: string
  hint?: ReactNode
  invalid?: boolean
} & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId()

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-stone-800"
      >
        {label}
      </label>

      <input
        id={id}
        aria-invalid={invalid || undefined}
        className={inputClass}
        {...props}
      />

      {hint && <div className="mt-2 text-sm text-stone-600">{hint}</div>}
    </div>
  )
}

export function PasswordField({
  label,
  hint,
  invalid,
  ...props
}: {
  label: string
  hint?: ReactNode
  invalid?: boolean
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  const id = useId()
  const [visible, setVisible] = useState(false)

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-stone-800"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          aria-invalid={invalid || undefined}
          className={inputClass + ' pr-20'}
          {...props}
        />

        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          aria-pressed={visible}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="zt-press absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-3 py-1.5 text-sm font-semibold text-teal-700 hover:bg-teal-50"
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>

      {hint && <div className="mt-2 text-sm text-stone-600">{hint}</div>}
    </div>
  )
}

export function Notice({
  tone,
  children,
}: {
  tone: 'error' | 'success' | 'info'
  children: ReactNode
}) {
  const styles = {
    error: 'border-coral-200 bg-coral-50 text-coral-800',
    success: 'border-teal-200 bg-teal-50 text-teal-900',
    info: 'border-stone-200 bg-stone-50 text-stone-700',
  }[tone]

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`zt-rise rounded-2xl border px-4 py-3 text-sm leading-6 ${styles}`}
    >
      {children}
    </div>
  )
}

export function SubmitButton({
  loading,
  children,
  loadingLabel,
}: {
  loading: boolean
  children: ReactNode
  loadingLabel: string
}) {
  return (
    <button type="submit" disabled={loading} className={submitClass}>
      {loading && (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-4 w-4 motion-safe:animate-spin"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeOpacity="0.3"
            strokeWidth="3"
          />
          <path
            d="M21 12a9 9 0 0 0-9-9"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      )}
      {loading ? loadingLabel : children}
    </button>
  )
}