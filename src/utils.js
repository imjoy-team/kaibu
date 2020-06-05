export function randId() {
  return Math.random()
    .toString(36)
    .substr(2, 10);
}
