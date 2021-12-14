import EditorJS from "@editorjs/editorjs";

import Header from "@editorjs/header";
import List from "@editorjs/nested-list";
import Marker from "@editorjs/marker";
import Quote from "@editorjs/quote";
import Table from "editorjs-table";
import CodeBox from "@bomdi/codebox";
import SimpleImage from "simple-image-editorjs";
import TableOfContents from "./TableOfContentsData";

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
    image: SimpleImage,
    quote: Quote,
    marker: {
      class: Marker,
      shortcut: "CMD+SHIFT+M",
    },
    codeBox: CodeBox,
    toc: TableOfContents,
  },
});

listenForMessage(service.getDocumentData, () => editor.save());
