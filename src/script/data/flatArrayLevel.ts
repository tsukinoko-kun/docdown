export const flatArrayKeepAsArray = <
  T,
  A extends Array<
    | T
    | Array<
        | T
        | Array<
            | T
            | Array<
                | T
                | Array<
                    | T
                    | Array<
                        | T
                        | Array<
                            | T
                            | Array<
                                T | Array<T | Array<T | Array<T | Array<T>>>>
                              >
                          >
                      >
                  >
              >
          >
      >
  >
>(
  arr: A,
  flatLevel: number = 1
): A => {
  if (flatLevel <= 0) {
    return arr;
  }

  const result = new Array<T>();

  for (const el of arr) {
    if (Array.isArray(el)) {
      result.push(...(flatArrayKeepAsArray(el, flatLevel - 1) as any));
    } else {
      result.push(el);
    }
  }

  return result as A;
};
