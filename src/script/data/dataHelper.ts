import type { Option } from "../Option";

export const isNullOrWhitespace = (str: string | null): boolean =>
  str === null || str.match(/^\s*$/) !== null;

export const mapArrayAllowEmpty = <T, U>(
  arr: Iterable<T>,
  func: (item: T) => Option<U>
): U[] => {
  const result: U[] = new Array<U>();
  for (const item of arr) {
    func(item).then((value) => result.push(value));
  }
  return result;
};

export const removeEmpty = <T>(arr: Iterable<T | Option<T>>): T[] => {
  const result: T[] = new Array<T>();
  for (const o of arr) {
    if ("isSome" in o) {
      o.then((value) => result.push(value));
    } else {
      result.push(o);
    }
  }
  return result;
};
