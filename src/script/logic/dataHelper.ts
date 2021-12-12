export const centimeterToPoint = <T extends number | Array<number>>(cm: T): T =>
  typeof cm === "number"
    ? (((cm / 2.54) * 72) as T)
    : (cm.map(centimeterToPoint) as T);

export const isNullOrWhitespace = (input: string | null | undefined): boolean =>
  !input || !input.trim();

export const removeEmpty = <T>(array: T[]): T[] =>
  array.filter((item) => {
    if (item === null || item === undefined) {
      return false;
    }

    if (typeof item === "object") {
      return Object.keys(item).length !== 0;
    }

    return true;
  });

export const mapIterableAllowEmpty = <T, U>(
  iterable: Iterable<T>,
  callback: (item: T) => U | undefined
): Array<U> => {
  const result = new Array<U>();

  for (const item of iterable) {
    const value = callback(item);

    if (value !== undefined) {
      result.push(value);
    }
  }

  return result;
};
