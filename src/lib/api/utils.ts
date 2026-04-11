export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return '알 수 없는 오류가 발생했습니다.';
}
