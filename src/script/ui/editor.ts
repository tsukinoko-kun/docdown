import EditorJS from "@editorjs/editorjs";

import Header from "@editorjs/header";
import List from "@editorjs/nested-list";
import Marker from "@editorjs/marker";
import Quote from "@editorjs/quote";
import Table from "@editorjs/table";

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
        rows: 8,
        cols: 4,
      },
    },
    quote: Quote,
    Marker: {
      class: Marker,
      shortcut: "CMD+SHIFT+M",
    },
  },
});

listenForMessage(service.getDocumentData, () => editor.save());
