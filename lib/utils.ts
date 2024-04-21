import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function valuesInAButNotInB(A: Array<any>, B: Array<any>) {
  const setB = new Set(B);
  return A.filter(value => !setB.has(value));
}