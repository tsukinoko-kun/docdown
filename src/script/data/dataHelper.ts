import type { Option } from "../Option";

export const isNullOrWhitespace = (str: string | null): boolean =>
  str === null || str.match(/^\s*$/) !== null;

export const mapArrayAllowEmpty = <T, U>(
  arr: Array<T>,
  func: (velue: T, index: number, array: Array<T>) => Option<U>
): U[] => {
  const result: U[] = new Array<U>();
  let i = 0;
  for (const item of arr) {
    func(item, i, arr).then((value) => {
      if (typeof value === "string") {
        if (isNullOrWhitespace(value)) {
          return;
        }
      }
      return result.push(value);
    });
    i++;
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

const createDataUrl = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const datUrlCache: Map<string, string> = new Map();
export const convertToDataUrl = async (url: string) => {
  const dataUrlFromCache = datUrlCache.get(url);
  if (dataUrlFromCache) {
    return dataUrlFromCache;
  }

  const response = await fetch(url);
  const blob = await response.blob();
  return await createDataUrl(blob);
};

export const centimeterToPoint = <T extends number | Array<number>>(cm: T): T =>
  typeof cm === "number"
    ? (((cm / 2.54) * 72) as T)
    : (cm.map(centimeterToPoint) as T);

export const parseFileNameToImageAlt = (fileName: string): string => {
  const fileNameWithoutExtension = fileName.split(".");
  fileNameWithoutExtension.pop();
  return fileNameWithoutExtension.join(" ").replace(/[_]+/g, " ");
};
