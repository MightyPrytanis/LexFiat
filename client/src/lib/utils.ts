import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// @CYRANO_REUSABLE: Component reusability tags
// @CYRANO_REUSABLE_UTILITY: Marks utility functions or helpers as reusable components
// @CYRANO_STANDALONE: Component with minimal dependencies
// @CYRANO_NEEDS_DOCS: Component needs documentation before export

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
