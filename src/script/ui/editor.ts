import EditorJS from "@editorjs/editorjs";

import Header from "@editorjs/header";
import List from "@editorjs/list";
import { listenForMessage, service } from "../router";

const editor = new EditorJS({
  holder: "editor",

  /**
   * Available Tools list.
   * Pass Tool's class or Settings object for each Tool you want to use
   */
  tools: {
    header: Header,
    list: List,
  },
});

listenForMessage(service.save, async () => await editor.save());

document.getElementById("save")?.addEventListener("click", () => {
  editor.save().then((outputData) => {
    console.log(outputData);
  });
});
