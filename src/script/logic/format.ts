import { isNullOrWhitespace } from "../data/dataHelper";
import { listenForMessage, sendMessage, service } from "../router";

const formatButtonEl = document.getElementById("format") as HTMLElement;
const codeEl = document.getElementById("code") as HTMLTextAreaElement;

const format = () => {
  const oldCode = codeEl.value;
  const newCode = oldCode
    .replace(/[«»《》‹›„“‟”"❝❞❮❯⹂〝〞〟＂]/g, '"')
    .replace(/[’‚‘‛‛❜❟]/g, "'")
    .split("\n")
    .filter(
      (line, i, arr) =>
        !(
          i !== 0 &&
          isNullOrWhitespace(line) &&
          ["#", "-", "*"].includes(arr[i - 1]![0]!)
        )
    )
    .join("\n")
    .replace(/^#+\s+/gm, "\n$&")
    .replace(/(?<!\/\n)(?=\/\n)/g, "\n")
    .replace(/^(\r?\n)+/g, "")
    .replace(/(\r?\n){3,}/g, "\n\n")
    .replace(/((\r?\n)+$)|(\S$)/g, "\n");

  if (oldCode !== newCode) {
    codeEl.value = newCode;
    return true;
  }

  return false;
};

formatButtonEl.addEventListener("click", () => {
  if (format()) {
    sendMessage(service.triggerRender, undefined);
  }
});

listenForMessage(service.format, format);
