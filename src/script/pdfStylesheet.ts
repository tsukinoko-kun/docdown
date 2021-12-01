import dracula from "./dracula";
import type { Style, TFontDictionary } from "pdfmake/interfaces";

import NotoSansRegular from "../font/Noto_Sans/NotoSans-Regular.ttf";
import NotoSansBold from "../font/Noto_Sans/NotoSans-Bold.ttf";
import NotoSansItalic from "../font/Noto_Sans/NotoSans-Italic.ttf";
import NotoSansBoldItalic from "../font/Noto_Sans/NotoSans-BoldItalic.ttf";

import JetBrainsMonoRegular from "../font/JetBrainsMono/JetBrainsMono-Regular.ttf";
import JetBrainsMonoBold from "../font/JetBrainsMono/JetBrainsMono-Bold.ttf";
import JetBrainsMonoItalic from "../font/JetBrainsMono/JetBrainsMono-Italic.ttf";
import JetBrainsMonoBoldItalic from "../font/JetBrainsMono/JetBrainsMono-BoldItalic.ttf";
import { getTheme } from "./theme";

export const fonts: TFontDictionary = {
  NotoSans: {
    normal: NotoSansRegular,
    bold: NotoSansBold,
    italics: NotoSansItalic,
    bolditalics: NotoSansBoldItalic,
  },
  JetBrainsMono: {
    normal: JetBrainsMonoRegular,
    bold: JetBrainsMonoBold,
    italics: JetBrainsMonoItalic,
    bolditalics: JetBrainsMonoBoldItalic,
  },
};

export const defaultStyle: Style = {
  fontSize: 11,
  color: "black",
  font: "NotoSans",
  lineHeight: 1.25,
  margin: 0,
};

export const syntaxStyles = new Map<string, Style>([
  [
    "hljs-comment",
    {
      color: dracula.comment.toString(),
      lineHeight: 1,
    },
  ],

  [
    "hljs-meta",
    {
      color: dracula.pink.toString(),
      lineHeight: 1,
    },
  ],

  [
    "hljs-keyword",
    {
      color: dracula.pink.toString(),
      lineHeight: 1,
    },
  ],

  [
    "hljs-literal",
    {
      color: dracula.purple.toString(),
      lineHeight: 1,
    },
  ],

  [
    "hljs-string",
    {
      color: dracula.yellow.toString(),
      lineHeight: 1,
    },
  ],

  [
    "hljs-type",
    {
      color: dracula.cyan.toString(),
      lineHeight: 1,
    },
  ],

  [
    "hljs-title",
    {
      color: dracula.green.toString(),
      lineHeight: 1,
    },
  ],

  [
    "class_",
    {
      color: dracula.cyan.toString(),
      lineHeight: 1,
    },
  ],
  [
    "hljs-attr",
    {
      color: dracula.orange.toString(),
      lineHeight: 1,
    },
  ],

  [
    "hljs-number",
    {
      color: dracula.purple.toString(),
      lineHeight: 1,
    },
  ],
]);

type styleName =
  | "title"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "toc_h1"
  | "toc_h2"
  | "toc_h3"
  | "th"
  | "td"
  | "a"
  | "code"
  | "sup"
  | "src"
  | "sub";

export const styles: () => { [key in styleName]: Style } = () => ({
  title: {
    fontSize: 32,
    bold: true,
    margin: [0, 10, 0, 2],
    color: getTheme().color.toString(),
  },
  h1: {
    fontSize: 24,
    bold: true,
    margin: [0, 10, 0, 2],
  },
  h2: {
    fontSize: 18,
    bold: true,
    margin: [0, 10, 0, 2],
  },
  h3: {
    fontSize: 16,
    bold: true,
    margin: [0, 5, 0, 0],
  },
  h4: {
    fontSize: 14,
    margin: [0, 5, 0, 0],
  },
  h5: {
    fontSize: 12,
    margin: [0, 5, 0, 0],
  },
  h6: {
    fontSize: 11,
    margin: [0, 5, 0, 0],
  },
  toc_h1: {
    fontSize: 18,
    bold: true,
  },
  toc_h2: {
    fontSize: 16,
    opacity: 0.75,
  },
  toc_h3: {
    fontSize: 14,
    opacity: 0.5,
  },
  th: {
    bold: true,
    alignment: "left",
  },
  td: {
    alignment: "left",
  },
  a: {
    color: getTheme().color.toString(),
    decoration: "underline",
  },
  code: {
    font: "JetBrainsMono",
    color: dracula.foreground.toString(),
    lineHeight: 1,
    preserveLeadingSpaces: true,
  },
  sup: {
    sup: true,
  },
  src: {
    sup: true,
    color: getTheme().color.toString(),
  },
  sub: {
    sub: true,
  },
});
