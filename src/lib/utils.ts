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

