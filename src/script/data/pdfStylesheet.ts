import dracula from "./dracula";
import type { Style, TFontDictionary } from "pdfmake/interfaces";

import NotoSansRegular from "../../font/Noto_Sans/NotoSans-Regular.ttf";
import NotoSansBold from "../../font/Noto_Sans/NotoSans-Bold.ttf";
import NotoSansItalic from "../../font/Noto_Sans/NotoSans-Italic.ttf";
import NotoSansBoldItalic from "../../font/Noto_Sans/NotoSans-BoldItalic.ttf";

import JetBrainsMonoRegular from "../../font/JetBrainsMono/JetBrainsMono-Regular.ttf";
import JetBrainsMonoBold from "../../font/JetBrainsMono/JetBrainsMono-Bold.ttf";
import JetBrainsMonoItalic from "../../font/JetBrainsMono/JetBrainsMono-Italic.ttf";
import JetBrainsMonoBoldItalic from "../../font/JetBrainsMono/JetBrainsMono-BoldItalic.ttf";

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
  fontSize: 12,
  lineHeight: 1.2,
  color: "#000000",
  font: "NotoSans",
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

export const styles: () => { [key: string]: Style } = () => {
  const themeColor = dracula.blue;

  return {
    title: {
      fontSize: 26,
      bold: true,
      margin: [0, 10, 0, 2],
      color: themeColor.toString(),
    },
    header1: {
      fontSize: 20,
      lineHeight: 1.5,
      bold: true,
      margin: [0, 10, 0, 2],
    },
    header2: {
      fontSize: 16,
      bold: true,
      margin: [0, 10, 0, 2],
    },
    header3: {
      fontSize: 14,
      bold: true,
      margin: [0, 5, 0, 0],
    },
    header4: {
      fontSize: 13,
      bold: true,
      margin: [0, 5, 0, 0],
    },
    header5: {
      fontSize: 12,
      bold: true,
      margin: [0, 5, 0, 0],
    },
    header6: {
      fontSize: 12,
      bold: true,
      margin: [0, 5, 0, 0],
    },
    toc_header1: {
      fontSize: 16,
      bold: true,
    },
    toc_header2: {
      fontSize: 15,
      opacity: 0.75,
    },
    toc_header3: {
      fontSize: 14,
      opacity: 0.5,
    },
    caption: {
      opacity: 0.5,
    },
    mark: {
      background: themeColor.toString(),
      padding: [0, 2, 0, 2],
    },
    a: {
      color: themeColor.toString(),
      decoration: "underline",
    },
    fontawesome: {
      font: "FontAwesome",
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
      color: themeColor.toString(),
      separator: ["(", ")"],
    },
    sub: {
      sub: true,
    },
    hidden: {
      color: "transparent",
      fontSize: 0,
    },
  };
};
