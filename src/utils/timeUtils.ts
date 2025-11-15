/**
 * Parse Swedish time strings like "45 minuter", "1 timme", "1 timme 30 minuter"
 * into total minutes
 */
export function parseTotalTimeToMinutes(timeString: string | undefined): number | null {
  if (!timeString) {
    return null;
  }

  const normalizedTime = timeString.toLowerCase().trim();
  let totalMinutes = 0;

  // Match hours: "1 timme", "2 timmar"
  const hoursMatch = normalizedTime.match(/(\d+)\s*timm(e|ar)/);
  if (hoursMatch) {
    totalMinutes += parseInt(hoursMatch[1], 10) * 60;
  }

  // Match minutes: "45 minuter"
  const minutesMatch = normalizedTime.match(/(\d+)\s*minuter/);
  if (minutesMatch) {
    totalMinutes += parseInt(minutesMatch[1], 10);
  }

  // If no matches found, return null
  if (totalMinutes === 0) {
    return null;
  }

  return totalMinutes;
}
