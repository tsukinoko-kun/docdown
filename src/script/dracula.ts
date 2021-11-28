class Color {
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

// const draculaDark = {
//   background: new Color(0x282a36),
//   currentLine: new Color(0x44475a),
//   foreground: new Color(0xf8f8f2),
//   comment: new Color(0x6272a4),
//   cyan: new Color(0x8be9fd),
//   blue: new Color(0x058cf1),
//   green: new Color(0x50fa7b),
//   orange: new Color(0xffb86c),
//   pink: new Color(0xff79c6),
//   purple: new Color(0xbd93f9),
//   red: new Color(0xff5555),
//   yellow: new Color(0xf1fa8c),
// };

const draculaLight = {
  background: new Color(0xf8f8f2),
  currentLine: new Color(0x44475a),
  foreground: new Color(0x282a36),
  comment: new Color(0x6272a4),
  cyan: new Color(0x8be9fd).lighten(-75),
  blue: new Color(0x058cf1),
  green: new Color(0x50fa7b).lighten(-50),
  orange: new Color(0xffb86c).lighten(-25),
  pink: new Color(0xff79c6).lighten(-50),
  purple: new Color(0xbd93f9).lighten(-50),
  red: new Color(0xff5555).lighten(-10),
  yellow: new Color(0xf1fa8c).lighten(-75),
};

export default draculaLight;
