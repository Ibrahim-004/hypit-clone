export function formatSeconds(total: number): string {
  const minutes = Math.floor(total / 60);
  const seconds = Math.floor(total % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
export function totalDurationSeconds(durations: number[]): number {
  return durations.reduce((sum, d) => sum + d, 0);
}
