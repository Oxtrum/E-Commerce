import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(
  value: number,
  currency = "BOB",
  locale = "es-BO",
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(value)
}

export function formatDate(value?: string | null) {
  if (!value) return "No informada"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("es-BO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}
