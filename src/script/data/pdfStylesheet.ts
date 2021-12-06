import dracula from "./dracula";
import type { Content, Style, TFontDictionary } from "pdfmake/interfaces";

import NotoSansRegular from "../../font/Noto_Sans/NotoSans-Regular.ttf";
import NotoSansBold from "../../font/Noto_Sans/NotoSans-Bold.ttf";
import NotoSansItalic from "../../font/Noto_Sans/NotoSans-Italic.ttf";
import NotoSansBoldItalic from "../../font/Noto_Sans/NotoSans-BoldItalic.ttf";

import JetBrainsMonoRegular from "../../font/JetBrainsMono/JetBrainsMono-Regular.ttf";
import JetBrainsMonoBold from "../../font/JetBrainsMono/JetBrainsMono-Bold.ttf";
import JetBrainsMonoItalic from "../../font/JetBrainsMono/JetBrainsMono-Italic.ttf";
import JetBrainsMonoBoldItalic from "../../font/JetBrainsMono/JetBrainsMono-BoldItalic.ttf";

import FontAwesomeRegular from "../../font/FontAwesome/fa-regular-400.ttf";
import FontAwesomeBold from "../../font/FontAwesome/fa-solid-900.ttf";

import { sendMessage, service } from "../router";

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
  FontAwesome: {
    normal: FontAwesomeRegular,
    bold: FontAwesomeBold,
  },
};

export const faChecked: Content[] = [
  {
    text: "\uf14a",
    style: "fontawesome",
  },
  { text: " " },
];
export const faUnchecked: Content[] = [
  {
    text: "\uf0c8",
    style: "fontawesome",
  },
  { text: " " },
];

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
  | "image_caption"
  | "a"
  | "fontawesome"
  | "code"
  | "sup"
  | "src"
  | "sub"
  | "hidden";

export const styles: () => { [key in styleName]: Style } = () => {
  const themeColor = sendMessage(service.getTheme, undefined).mapOr(
    dracula.blue,
    (t) => t.color
  );

  return {
    title: {
      fontSize: 26,
      bold: true,
      margin: [0, 10, 0, 2],
      color: themeColor.toString(),
    },
    h1: {
      fontSize: 20,
      lineHeight: 1.5,
      bold: true,
      margin: [0, 10, 0, 2],
    },
    h2: {
      fontSize: 16,
      bold: true,
      margin: [0, 10, 0, 2],
    },
    h3: {
      fontSize: 14,
      bold: true,
      margin: [0, 5, 0, 0],
    },
    h4: {
      fontSize: 13,
      bold: true,
      margin: [0, 5, 0, 0],
    },
    h5: {
      fontSize: 12,
      bold: true,
      margin: [0, 5, 0, 0],
    },
    h6: {
      fontSize: 12,
      bold: true,
      margin: [0, 5, 0, 0],
    },
    toc_h1: {
      fontSize: 16,
      bold: true,
    },
    toc_h2: {
      fontSize: 15,
      opacity: 0.75,
    },
    toc_h3: {
      fontSize: 14,
      opacity: 0.5,
    },
    image_caption: {
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
