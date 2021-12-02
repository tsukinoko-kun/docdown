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

/**
 * Represents a RGB color.
 */
export class Color {
  private readonly r: number;
  private readonly g: number;
  private readonly b: number;

  constructor(rgb: number) {
    this.r = (rgb >> 16) & 0xff;
    this.g = (rgb >> 8) & 0xff;
    this.b = rgb & 0xff;
  }

  /**
   * Lighting up the color by the given amount.
   * @param amount -255 to 255
   */
  lighten(amount: number): Color {
    return new Color(
      (Math.max(0, Math.min(255, this.r + amount)) << 16) |
        (Math.max(0, Math.min(255, this.g + amount)) << 8) |
        Math.max(0, Math.min(255, this.b + amount))
    );
  }

  /**
   * multiply the color by the given amount.
   * @param amount 0.0 to 1.0
   */
  saturate(amount: number): Color {
    return new Color(
      (Math.max(0, Math.min(255, this.r * amount)) << 16) |
        (Math.max(0, Math.min(255, this.g * amount)) << 8) |
        Math.max(0, Math.min(255, this.b * amount))
    );
  }

  toString(): string {
    return (
      "#" + this.r.toString(16) + this.g.toString(16) + this.b.toString(16)
    );
  }
}
