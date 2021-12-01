import { setLocale } from "./local";
import { setTitle } from "./session";
import { importSourcesJSON } from "./sources";
import { setTheme } from "./theme";

const codeEl = document.getElementById("code") as HTMLTextAreaElement;

const dropFile = (ev: DragEvent) => {
  ev.preventDefault();
  ev.stopPropagation();

  document.body.classList.remove("dragover");

  if (!ev.dataTransfer) {
    return;
  }

  const files = ev.dataTransfer.files;
  if (files.length === 0) {
    return;
  }

  const file = files[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    if (file.name.endsWith(".ddd")) {
      const data = JSON.parse(reader.result as string);
      setTitle(data.title);
      setLocale(data.language);
      codeEl.value = data.code;
      importSourcesJSON(data.sources);
      setTheme(data.theme);
    } else if (file.name.endsWith(".md")) {
      setTitle(file.name.substring(0, file.name.length - 3));
      codeEl.value = reader.result as string;
      importSourcesJSON([] as any);
    }

    triggerRender();
  };

  reader.readAsText(file);
};

document.body.addEventListener("drop", dropFile, {
  passive: false,
  capture: true,
});
