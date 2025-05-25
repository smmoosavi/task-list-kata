export function takeUntilWhitespace(str: string): [string, string] {
  const pos = str.indexOf(' ');
  if (pos === -1) {
    return [str, ''];
  }
  return [str.substring(0, pos), str.substring(pos + 1)];
}
