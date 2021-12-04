import { cancelAllAlerts, userAlert, userForm, userSelect } from "./alert";
import { findInText, getSelectedText, textSelected } from "./editor";
import { getText, language, setLocale, textId } from "../data/local";
import { saveLocal, setTitle, getTitle } from "../logic/session";
import { sendMessage, service } from "../router";

let mode: "code" | "display" | "both" = "both";

document.body.setAttribute("view-mode", mode);

const surroundChar = ["*", "'", '"', "Dead", "(", "{", "[", "_", "~"];
const surroundCharB = [
  ["*", "*"],
  ["'", "'"],
  ['"', '"'],
  ["`", "`"],
  ["(", ")"],
  ["{", "}"],
  ["[", "]"],
  ["_", "_"],
  ["~", "~"],
];

const codeEl = document.getElementById("code") as HTMLTextAreaElement;

const toggleViewMode = (splitVertical: boolean) => {
  if (splitVertical) {
    switch (mode) {
      case "display":
      case "code":
        mode = "both";
        break;
      case "both":
        mode = "code";
        break;
    }
  } else {
    switch (mode) {
      case "display":
      case "both":
        mode = "code";
        break;
      case "code":
        mode = "display";
        break;
    }
  }
  document.body.setAttribute("view-mode", mode);
};

const findInCode = () => {
  userForm([
    {
      name: "searchValue",
      label: getText(textId.find),
      required: true,
      type: "text",
      value: getSelectedText(codeEl),
    },
  ])
    .then((result) => {
      findInText(codeEl, result.searchValue);
      sendMessage(service.triggerRender, undefined);
    })
    .catch((err) => {
      if (err) {
        console.info(err);
      }
    });
};

const replaceInCode = () => {
  userForm([
    {
      name: "searchValue",
      label: getText(textId.find),
      required: true,
      type: "text",
      value: getSelectedText(codeEl),
    },
    {
      name: "replaceValue",
      label: getText(textId.replace),
      required: true,
      type: "text",
    },
    {
      name: "replaceAll",
      label: getText(textId.replace_all),
      required: false,
      type: "checkbox",
    },
  ])
    .then((result) => {
      if (result.replaceAll) {
        sendMessage(service.replaceAllSubstringsInText, {
          textEl: codeEl,
          searchValue: result.searchValue,
          replaceValue: result.replaceValue,
        });
      } else {
        codeEl.value = codeEl.value.replace(
          result.searchValue,
          result.replaceValue
        );
      }
      sendMessage(service.triggerRender, undefined);
    })
    .catch((err) => {
      if (err) {
        console.info(err);
      }
    });
};

const tab = (revert: boolean) => {
  if (textSelected(codeEl)) {
    if (revert) {
      sendMessage(service.replaceSelectedText, {
        textEl: codeEl,
        replacement: (t) => t.replace(/^ {1,2}/, ""),
      });
    } else {
      sendMessage(service.replaceSelectedText, {
        textEl: codeEl,
        replacement: (t) => "  " + t,
      });
    }
  } else {
    sendMessage(service.insertText, {
      textEl: codeEl,
      textToInsert: "  ",
      focusAfterInsert: false,
    });
  }
  sendMessage(service.triggerRender, undefined);
};

const newline = () => {
  if (document.activeElement === codeEl) {
    const start = codeEl.selectionStart;
    const end = codeEl.selectionEnd;

    if (end === start) {
      // if at end of current line and line contains text
      if (codeEl.value[start] === "\n" && codeEl.value[start - 1] !== "\n") {
        const newLinePos = codeEl.value.lastIndexOf("\n", start - 1);
        const currentLine = codeEl.value.substring(newLinePos + 1, end);

        if (/^[ \t]*[-|*][ \t]$/.test(currentLine)) {
          codeEl.value =
            codeEl.value.substring(0, newLinePos) +
            "\n" +
            codeEl.value.substring(end);
          codeEl.selectionEnd = codeEl.selectionStart = newLinePos + 1;
        } else {
          // continue list in next line
          const reg = /^[ \t]*[-|*]?[ \t](?![ \t])/.exec(currentLine);
          if (reg && reg.length === 1) {
            sendMessage(service.insertText, {
              textEl: codeEl,
              textToInsert: "\n" + reg[0],
              focusAfterInsert: false,
            });
          } else {
            sendMessage(service.insertText, {
              textEl: codeEl,
              textToInsert: "\n",
              focusAfterInsert: false,
            });
          }
        }
      } else {
        sendMessage(service.insertText, {
          textEl: codeEl,
          textToInsert: "\n",
          focusAfterInsert: false,
        });
      }
    } else {
      sendMessage(service.replaceSelectedText, {
        textEl: codeEl,
        replacement: "\n",
      });
    }
    sendMessage(service.triggerRender, undefined);
  }
};

const surround = (char: string, alt: boolean): boolean => {
  let surroundCharIndex = surroundChar.indexOf(char);
  if (surroundCharIndex !== -1) {
    const surroundLR = surroundCharB.at(surroundCharIndex);
    if (!surroundLR) {
      return false;
    }

    sendMessage(service.replaceSelectedText, {
      textEl: codeEl,
      replacement: (t) => surroundLR[0] + t + surroundLR[1],
      insertIfNoSelection: false,
    }).when((value) => {
      if (value) {
        sendMessage(service.triggerRender, undefined);
      }
    });
    return true;
  } else if (char === "#") {
    return sendMessage(service.replaceSelectedText, {
      textEl: codeEl,
      replacement: (t) => {
        if (alt) {
          if (t.startsWith("#")) {
            return t.substring(1);
          } else {
            return "#";
          }
        } else {
          if (t.startsWith("#")) {
            return "#" + t;
          } else {
            return "# " + t;
          }
        }
      },
      insertIfNoSelection: false,
    })
      .when((value) => {
        if (value) {
          sendMessage(service.triggerRender, undefined);
          return true;
        } else {
          return false;
        }
      })
      .or(false);
  }

  return false;
};

const showHelp = () => {
  userAlert(
    `<table class="help">
      <tr><th>${getText(textId.shortcut)}</th><th>${getText(
      textId.description
    )}</th></tr>
      <tr><td>F1</td><td>${getText(textId.show_help)}</td></tr>
      <tr><td>F2</td><td>${getText(textId.rename_file)}</td></tr>
      <tr><td>CTRL&nbsp;L</td><td>${getText(textId.set_language)}</td></tr>
      <tr><td>CTRL&nbsp;S</td><td>${getText(textId.download_file)}</td></tr>
      <tr><td>CTRL&nbsp;P</td><td>${getText(textId.print)}</td></tr>
      <tr><td>CTRL&nbsp;F</td><td>${getText(textId.find)}</td></tr>
      <tr><td>CTRL&nbsp;&#8679;&nbsp;F</td><td>${getText(
        textId.find_and_replace
      )}</td></tr>
      <tr><td>CTRL&nbsp;E</td><td>${getText(
        textId.switch_code_render
      )}</td></tr>
      <tr><td>CTRL&nbsp;&#8679;&nbsp;E</td><td>${getText(
        textId.toggle_display_render
      )}</td></tr>
      <tr><td>CTRL&nbsp;&plus;</td><td>${getText(textId.zoom_in)}</td></tr>
      <tr><td>CTRL&nbsp;&minus;</td><td>${getText(textId.zoom_out)}</td></tr>
      </table>`,
    true
  );
};

const renameFile = () => {
  userForm([
    {
      name: "newName",
      label: getText(textId.rename_file),
      required: true,
      type: "text",
      value: getTitle(),
    },
  ])
    .then((result) => {
      setTitle(result.newName);
    })
    .catch((err) => {
      if (err) {
        console.info(err);
      }
    });
};

const switchLanguage = () => {
  userSelect<language>(
    getText(textId.set_language),
    {
      label: "Deutsch",
      value: "de",
    },
    {
      label: "English",
      value: "en",
    }
  )
    .then((result) => {
      setLocale(result);
      sendMessage(service.triggerRender, undefined);
    })
    .catch((err) => {
      if (err) {
        console.info(err);
      }
    });
};

const cancel = (target: EventTarget | null) => {
  if (target && "blur" in target) {
    (target as HTMLInputElement).blur();
  }

  cancelAllAlerts();
};

window.addEventListener(
  "keydown",
  (ev) => {
    if (ev.ctrlKey || ev.metaKey) {
      switch (ev.key.toLowerCase()) {
        case "e":
          ev.preventDefault();
          toggleViewMode(ev.shiftKey);
          break;
        case "s":
          ev.preventDefault();
          saveLocal();
          break;
        case "f":
          ev.preventDefault();
          if (!ev.shiftKey) {
            findInCode();
          } else {
            replaceInCode();
          }
          break;
        case "l":
          ev.preventDefault();
          switchLanguage();
          break;
        case "p":
          ev.preventDefault();
          sendMessage(service.createPdf, 0 /* pdfOutput.print */);
          break;
      }
    } else if (ev.key === "Escape") {
      ev.preventDefault();
      cancel(ev.target);
    } else if (ev.key === "F1") {
      ev.preventDefault();
      showHelp();
    } else if (ev.key === "F2") {
      ev.preventDefault();
      renameFile();
    } else if (document.activeElement === codeEl) {
      if (ev.key === "Tab") {
        ev.preventDefault();
        tab(ev.shiftKey);
      } else if (ev.key === "Enter") {
        ev.preventDefault();
        newline();
      } else {
        if (surround(ev.key, ev.altKey)) {
          ev.preventDefault();
        }
      }
    }
  },
  {
    capture: true,
    passive: false,
  }
);
