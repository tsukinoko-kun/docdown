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
  callback: (item: T) => U | undefined | null
): Array<U> => {
  const result = new Array<U>();

  for (const item of iterable) {
    const value = callback(item);

    if (value !== undefined && value !== null) {
      result.push(value);
    }
  }

  return result;
};

export const mapIterableAllowEmptyAsync = async <T, U>(
  iterable: Iterable<T>,
  callback: (item: T) => Promise<U>,
  keepOrder: boolean = true
): Promise<Array<U>> => {
  const result = new Array<Promise<U>>();

  if (keepOrder) {
    for await (const item of iterable) {
      result.push(callback(item));
    }
  } else {
    for (const item of iterable) {
      result.push(callback(item));
    }
  }

  return await Promise.all(result);
};

export const firstIfSingle = <T>(arr: Array<T>): T | Array<T> =>
  Array.isArray(arr) ? (arr.length === 1 ? arr[0]! : arr) : arr;

export const tryFlatIfArray = <T>(arr: Array<T> | T): Array<T> | T =>
  (Array.isArray(arr) ? firstIfSingle(arr.flat()) : arr) as Array<T>;
