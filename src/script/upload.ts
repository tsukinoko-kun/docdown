import { userAlert } from "./alert";
import { upload } from "./database";
import { replaceSelectedText } from "./editor";
import { getText, textId } from "./local";
import { importData } from "./session";

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

  if (file.size > 1048576) {
    userAlert(getText(textId.file_too_big) + ` (${file.size / 1048576} MiB)`);
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    if (file.name.endsWith(".ddd")) {
      importData(JSON.parse(reader.result as string));
    } else if (file.name.endsWith(".md")) {
      importData({
        title: file.name.substring(0, file.name.length - 3),
        code: reader.result as string,
      });
    } else if (
      document.activeElement === codeEl &&
      file.type.startsWith("image/")
    ) {
      upload(file)
        .then((url) => {
          replaceSelectedText(codeEl, `![${file.name}](${url})`);
          triggerRender();
        })
        .catch((err) => {
          if (err) {
            console.info(err);
          }
        });
    }
  };

  reader.readAsText(file);
};

document.body.addEventListener("drop", dropFile, {
  passive: false,
  capture: true,
});
