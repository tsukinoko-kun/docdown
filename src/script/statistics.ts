import { getLocalizedString } from "./local";
import passive from "./passive";

const displayEl = document.getElementById("display") as HTMLElement;
const codeEl = document.getElementById("code") as HTMLTextAreaElement;
const wordCountEl = document.getElementById("word-count") as HTMLElement;
const cursorEl = document.getElementById("cursor") as HTMLElement;

export const countWords = () => {
  const words = displayEl.innerText.match(/[\w\d]+/g)?.length ?? 0;

  wordCountEl.innerText = `${words} ${getLocalizedString("words")}`;
};

const updateCursor = () => {
  const { selectionStart, selectionEnd } = codeEl;

  const line = codeEl.value.substring(0, selectionStart).split("\n").length;
  const lineStr = `${getLocalizedString("line")} ${line}`;

  const column =
    selectionStart -
    codeEl.value.lastIndexOf("\n", Math.max(0, selectionStart - 1));
  const columnStr = `${getLocalizedString("column")} ${column}`;

  const selection = selectionEnd - selectionStart;

  if (selection > 0) {
    const selectionStr = `${selection} ${getLocalizedString("selected")}`;

    cursorEl.innerText = `${lineStr}, ${columnStr} (${selectionStr})`;
  } else {
    cursorEl.innerText = `${lineStr}, ${columnStr}`;
  }
};

codeEl.addEventListener("input", updateCursor, passive);
codeEl.addEventListener("mouseup", updateCursor, passive);
codeEl.addEventListener("keyup", updateCursor, passive);

updateCursor();
