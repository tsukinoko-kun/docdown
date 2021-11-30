export const isNullOrWhitespace = (str: string | null): boolean =>
  str === null || str.match(/^\s*$/) !== null;

export const mapArrayAllowEmpty = <T, U>(
  arr: Iterable<T>,
  func: (item: T) => U | null
): U[] => {
  const result: U[] = new Array<U>();
  for (const item of arr) {
    const value = func(item);
    if (value !== undefined && value !== null) {
      result.push(value);
    }
  }
  return result;
};

export const removeEmpty = <T>(arr: Iterable<T | null>): T[] => {
  const result: T[] = new Array<T>();
  for (const item of arr) {
    if (item !== null) {
      result.push(item);
    }
  }
  return result;
};
