export function roomKey(code: string, sessionId: string): string {
  return `ottv2-${code}-${sessionId}`;
}
