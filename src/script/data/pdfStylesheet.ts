import dracula from "./dracula";
import type { Style, TFontDictionary } from "pdfmake/interfaces";

import NotoSansRegular from "../../font/Noto_Sans/NotoSans-Regular.ttf";
import NotoSansBold from "../../font/Noto_Sans/NotoSans-Bold.ttf";
import NotoSansItalic from "../../font/Noto_Sans/NotoSans-Italic.ttf";
import NotoSansBoldItalic from "../../font/Noto_Sans/NotoSans-BoldItalic.ttf";
import NotoColorEmoji from "../../font/Noto_Sans/NotoColorEmoji.otf";

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
  NotoColorEmoji: {
    normal: NotoColorEmoji,
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
    "hljs-built_in",
    {
      color: dracula.cyan.toString(),
    },
  ],
  [
    "hljs-selector-tag",
    {
      color: dracula.cyan.toString(),
      bold: true,
    },
  ],
  [
    "hljs-section",
    {
      color: dracula.cyan.toString(),
      bold: true,
    },
  ],
  [
    "hljs-link",
    {
      color: dracula.cyan.toString(),
    },
  ],
  [
    "hljs-keyword",
    {
      color: dracula.pink.toString(),
      bold: true,
    },
  ],
  [
    "hljs",
    {
      color: dracula.background.toString(),
    },
  ],
  [
    "hljs-subst",
    {
      color: dracula.background.toString(),
    },
  ],
  [
    "hljs-title",
    {
      italics: true,
      color: dracula.green.toString(),
      bold: true,
    },
  ],
  [
    "hljs-attr",
    {
      italics: true,
      color: dracula.green.toString(),
    },
  ],
  [
    "hljs-attribute",
    {
      italics: true,
      color: dracula.green.toString(),
    },
  ],
  [
    "hljs-meta-keyword",
    {
      italics: true,
      color: dracula.green.toString(),
    },
  ],
  [
    "hljs-string",
    {
      color: dracula.yellow.toString(),
    },
  ],
  [
    "hljs-meta",
    {
      color: dracula.yellow.toString(),
    },
  ],
  [
    "hljs-tag",
    {
      color: dracula.yellow.toString(),
      bold: true,
    },
  ],
  [
    "hljs-name",
    {
      color: dracula.yellow.toString(),
      bold: true,
    },
  ],
  [
    "hljs-type",
    {
      color: dracula.yellow.toString(),
      bold: true,
    },
  ],
  [
    "hljs-symbol",
    {
      color: dracula.yellow.toString(),
    },
  ],
  [
    "hljs-bullet",
    {
      color: dracula.yellow.toString(),
    },
  ],
  [
    "hljs-addition",
    {
      color: dracula.yellow.toString(),
    },
  ],
  [
    "hljs-variable",
    {
      color: dracula.yellow.toString(),
    },
  ],
  [
    "hljs-template-tag",
    {
      color: dracula.yellow.toString(),
    },
  ],
  [
    "hljs-template-variable",
    {
      color: dracula.yellow.toString(),
    },
  ],
  [
    "hljs-comment",
    {
      color: dracula.comment.toString(),
    },
  ],
  [
    "hljs-quote",
    {
      color: dracula.comment.toString(),
    },
  ],
  [
    "hljs-deletion",
    {
      color: dracula.comment.toString(),
    },
  ],
  [
    "hljs-doctag",
    {
      bold: true,
    },
  ],
  [
    "hljs-strong",
    {
      bold: true,
    },
  ],
  [
    "hljs-literal",
    {
      color: dracula.purple.toString(),
      bold: true,
    },
  ],
  [
    "hljs-number",
    {
      color: dracula.purple.toString(),
    },
  ],
  [
    "hljs-emphasis",
    {
      italics: true,
    },
  ],
]);

export const styles: () => { [key: string]: Style } = () => {
  const themeColor = dracula.blue;
  const markColor = dracula.yellow;

  return {
    title: {
      fontSize: Math.round(defaultStyle.fontSize! * 2),
      bold: true,
      margin: [0, 10, 0, 2],
      color: themeColor.toString(),
    },
    header1: {
      fontSize: Math.round(defaultStyle.fontSize! * 1.6666),
      lineHeight: 1.5,
      bold: true,
      margin: [0, 10, 0, 2],
    },
    header2: {
      fontSize: Math.round(defaultStyle.fontSize! * 1.3333),
      bold: true,
      margin: [0, 10, 0, 2],
    },
    header3: {
      fontSize: Math.round(defaultStyle.fontSize! * 1.1666),
      bold: true,
      margin: [0, 5, 0, 0],
    },
    header4: {
      fontSize: Math.round(defaultStyle.fontSize! * 1.08333),
      bold: true,
      margin: [0, 5, 0, 0],
    },
    header5: {
      fontSize: defaultStyle.fontSize!,
      bold: true,
      margin: [0, 5, 0, 0],
    },
    header6: {
      fontSize: defaultStyle.fontSize!,
      bold: true,
      margin: [0, 5, 0, 0],
    },
    toc_header1: {
      fontSize: Math.round(defaultStyle.fontSize! * 1.3333),
      bold: true,
    },
    toc_header2: {
      fontSize: Math.round(defaultStyle.fontSize! * 1.25),
      opacity: 0.75,
    },
    toc_header3: {
      fontSize: Math.round(defaultStyle.fontSize! * 1.1666),
      opacity: 0.5,
    },
    paragraph: {
      margin: [0, 0, 0, 10],
    },
    caption: {
      opacity: 0.5,
      margin: [0, 0, 0, 10],
    },
    mark: {
      background: markColor.toString(),
      // padding: [0, 2, 0, 2],
    },
    anchor: {
      color: themeColor.toString(),
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
      color: themeColor.toString(),
    },
    sub: {
      sub: true,
    },
    hidden: {
      color: "transparent",
      fontSize: 0,
    },
    emoji: {
      font: "NotoColorEmoji",
      bold: false,
      italics: false,
    },
  };
};
