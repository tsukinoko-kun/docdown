import EditorJS from "@editorjs/editorjs";

import Header from "@editorjs/header";
import List from "@editorjs/nested-list";
import Marker from "@editorjs/marker";
import Quote from "@editorjs/quote";
import Table from "editorjs-table";
import CodeBox from "@bomdi/codebox";

import { listenForMessage, service } from "../router";

const editor = new EditorJS({
  holder: "editor",
  autofocus: true,
  tools: {
    header: Header,
    list: List,
    table: {
      class: Table,
      inlineToolbar: true,
      config: {
        rows: 2,
        cols: 3,
      },
    },
    quote: Quote,
    Marker: {
      class: Marker,
      shortcut: "CMD+SHIFT+M",
    },
    codeBox: {
      class: CodeBox,
      config: {
        // themeURL: "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.3.1/build/styles/dracula.min.css", // Optional
        themeName: "dracula", // Optional
        useDefaultTheme: "dark", // Optional. This also determines the background color of the language select drop-down
      },
    },
  },
});

listenForMessage(service.getDocumentData, () => editor.save());
