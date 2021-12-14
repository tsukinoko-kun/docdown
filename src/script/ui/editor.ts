import EditorJS from "@editorjs/editorjs";
import type { EditorConfig } from "@editorjs/editorjs";

import Header from "@editorjs/header";
import List from "@editorjs/nested-list";
import Marker from "@editorjs/marker";
import Quote from "@editorjs/quote";
import Table from "editorjs-table";
import CodeBox from "@bomdi/codebox";
import SimpleImage from "simple-image-editorjs";
import TableOfContents from "./TableOfContentsData";

import { listenForMessage, service } from "../router";

const editorHolder = document.getElementById("editor") as HTMLElement;

const editorConfig: EditorConfig = {
  holder: editorHolder,
  data: undefined as any,
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
};

let editor = new EditorJS(editorConfig);

listenForMessage(service.getDocumentData, () => editor.save());
listenForMessage(service.setDocumentData, (data) => {
  editorConfig.data = data;
  editor.destroy();
  editor = editor = new EditorJS(editorConfig);
});
