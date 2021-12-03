import { Color } from "../logic/dataHelper";

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
