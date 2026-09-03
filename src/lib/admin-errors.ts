export function friendlyError(message: string): string {
  if (message.includes("duplicate key") && message.includes("slug")) {
    return "이미 사용 중인 slug예요. 다른 값을 입력해주세요.";
  }
  return "저장에 실패했어요. 다시 시도해 주세요.";
}
