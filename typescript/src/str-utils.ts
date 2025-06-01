export function takeOne(s: string): [string, string] {
  // find first white space
  let pos = s.search(/\s/);
  if (pos === -1) {
    return [s, ''];
  }
  return [s.substring(0, pos), s.substring(pos + 1)];
}
