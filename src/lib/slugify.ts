// 어드민 폼에서 제목으로부터 slug를 제안할 때 쓰는 간단한 변환 — 한글은 그대로 두고
// (한글 slug도 URL에서 정상 동작), 공백/특수문자만 하이픈으로 정리한다.
export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
