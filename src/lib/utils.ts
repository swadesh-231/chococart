import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function capitalizeFirstLetter(value: string) {
  if (!value) return value
  return value.charAt(0).toUpperCase() + value.slice(1)
}

/** Renders a timestamp as "August 8, 2026". */
export function formatDate(value: string | Date | null | undefined) {
  if (!value) return "—"

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return "—"

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

/** Up to two letters for an avatar fallback: "Jane Doe" -> "JD". */
export function initialsOf(name: string | null | undefined, fallback = "?") {
  const letters = (name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .filter((letter) => /\p{L}/u.test(letter))

  if (!letters.length) return fallback

  return `${letters[0]}${letters.length > 1 ? letters[letters.length - 1] : ""}`.toUpperCase()
}

/** Prices are stored as whole rupees. */
export function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}
