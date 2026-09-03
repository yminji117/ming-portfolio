// 범위를 벗어나면 원본 배열 참조를 그대로 반환한다 — 호출부에서 `next !== list`로
// 실제로 움직였는지 확인하고 onChange/setState를 건너뛸 수 있다.
export function moveItem<T>(list: T[], index: number, dir: -1 | 1): T[] {
  const target = index + dir;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
