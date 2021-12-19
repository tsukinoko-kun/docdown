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
import { Source } from "./Source";

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
    marker: Marker,
    codeBox: CodeBox,
    toc: TableOfContents,
    source: Source,
  },
  tunes: ["source"],
};

let editor = new EditorJS(editorConfig);

listenForMessage(service.getDocumentData, () => editor.save());
listenForMessage(service.getSaveData, async () => ({
  editor: await editor.save(),
}));
listenForMessage(service.initFromData, (data) => {
  if (data.editor) {
    editorConfig.data = data.editor;
    editor.destroy();
    editor = editor = new EditorJS(editorConfig);
  }
});
