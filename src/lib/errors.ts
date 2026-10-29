/** An Error with a `code`, like Firebase's errors, so UI code can map it to a message. */
export function codedError(code: string, message: string): Error & { code: string } {
  return Object.assign(new Error(message), { code });
}

/** The `code` of a Firebase-style error, if it has one. */
export function errorCode(error: unknown): string | undefined {
  const code = (error as { code?: unknown } | null)?.code;
  return typeof code === "string" ? code : undefined;
}
