import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type LogData = Record<string, unknown> | unknown[] | string | number | boolean | null | undefined
type ErrorData = Error | string | Record<string, unknown> | null | undefined

export const logger = {
  info: (message: string, data?: LogData) => {
    console.log(`[INFO] ${message}`, data ?? '')
  },
  error: (message: string, error?: ErrorData) => {
    console.error(`[ERROR] ${message}`, error ?? '')
  },
  debug: (message: string, data?: LogData) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, data ?? '')
    }
  }
}
