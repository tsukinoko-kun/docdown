import { userAlert, userForm, userSelect } from "./alert";
import {
  findInText,
  getSelectedText,
  insertText,
  replaceAllSubstringsInText,
  replaceSelectedText,
  textSelected,
} from "./editor";
import { getLocalizedString, language, setLocale } from "./local";
import { loadLocal, saveLocal, setTitle, getTitle } from "./session";

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
      label: getLocalizedString("find"),
      required: true,
      type: "text",
      value: getSelectedText(codeEl),
    },
  ])
    .then((result) => {
      findInText(codeEl, result.searchValue);
      triggerRender();
    })
    .catch((err) => {
      if (err) {
        console.error(err);
      }
    });
};

const replaceInCode = () => {
  userForm([
    {
      name: "searchValue",
      label: getLocalizedString("find"),
      required: true,
      type: "text",
      value: getSelectedText(codeEl),
    },
    {
      name: "replaceValue",
      label: getLocalizedString("replace"),
      required: true,
      type: "text",
    },
    {
      name: "replaceAll",
      label: getLocalizedString("replace_all"),
      required: false,
      type: "checkbox",
    },
  ])
    .then((result) => {
      if (result.replaceAll) {
        replaceAllSubstringsInText(
          codeEl,
          result.searchValue,
          result.replaceValue
        );
      } else {
        codeEl.value = codeEl.value.replace(
          result.searchValue,
          result.replaceValue
        );
      }
      triggerRender();
    })
    .catch((err) => {
      if (err) {
        console.error(err);
      }
    });
};

const tab = (revert: boolean) => {
  if (textSelected(codeEl)) {
    if (revert) {
      replaceSelectedText(codeEl, (t) => t.replace(/^ {1,2}/, ""));
    } else {
      replaceSelectedText(codeEl, (t) => "  " + t);
    }
  } else {
    insertText(codeEl, "  ", false);
  }
  triggerRender();
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
            insertText(codeEl, "\n" + reg[0], false);
          } else {
            insertText(codeEl, "\n", false);
          }
        }
      } else {
        insertText(codeEl, "\n", false);
      }
    } else {
      replaceSelectedText(codeEl, () => "\n");
    }
    triggerRender();
  }
};

const surround = (char: string, alt: boolean): boolean => {
  let surroundCharIndex = surroundChar.indexOf(char);
  if (surroundCharIndex !== -1) {
    const surroundLR = surroundCharB.at(surroundCharIndex);
    if (!surroundLR) {
      return false;
    }

    if (
      replaceSelectedText(
        codeEl,
        (t) => surroundLR[0] + t + surroundLR[1],
        false
      )
    ) {
      triggerRender();
      return true;
    }
  } else if (char === "#") {
    if (
      replaceSelectedText(
        codeEl,
        (t) => {
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
        false
      )
    ) {
      triggerRender();
      return true;
    }
  }

  return false;
};

const showHelp = () => {
  userAlert(
    [
      '<table class="help">',
      `<tr><th>${getLocalizedString("shortcut")}</th><th>${getLocalizedString(
        "description"
      )}</th></tr>`,
      `<tr><td>F1</td><td>${getLocalizedString("show_help")}</td></tr>`,
      `<tr><td>F2</td><td>${getLocalizedString("rename_file")}</td></tr>`,
      `<tr><td>CTRL&nbsp;L</td><td>${getLocalizedString(
        "set_language"
      )}</td></tr>`,
      `<tr><td>CTRL&nbsp;O</td><td>${getLocalizedString(
        "open_local_file"
      )}</td></tr>`,
      `<tr><td>CTRL&nbsp;S</td><td>${getLocalizedString(
        "download_file"
      )}</td></tr>`,
      `<tr><td>CTRL&nbsp;P</td><td>${getLocalizedString("print")}</td></tr>`,
      `<tr><td>CTRL&nbsp;F</td><td>${getLocalizedString("find")}</td></tr>`,
      `<tr><td>CTRL&nbsp;&#8679;&nbsp;F</td><td>${getLocalizedString(
        "find_and_replace"
      )}</td></tr>`,
      `<tr><td>CTRL&nbsp;E</td><td>${getLocalizedString(
        "switch_code_render"
      )}</td></tr>`,
      `<tr><td>CTRL&nbsp;&#8679;&nbsp;E</td><td>${getLocalizedString(
        "toggle_display_render"
      )}</td></tr>`,
      `<tr><td>CTRL&nbsp;&plus;</td><td>${getLocalizedString(
        "zoom_in"
      )}</td></tr>`,
      `<tr><td>CTRL&nbsp;&minus;</td><td>${getLocalizedString(
        "zoom_out"
      )}</td></tr>`,
      "</table>",
    ].join(""),
    true
  );
};

const renameFile = () => {
  userForm([
    {
      name: "newName",
      label: getLocalizedString("rename_file"),
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
        console.error(err);
      }
    });
};

const switchLanguage = () => {
  userSelect<language>(
    getLocalizedString("set_language"),
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
      triggerRender();
    })
    .catch((err) => {
      if (err) {
        console.error(err);
      }
    });
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

        case "o":
          ev.preventDefault();
          loadLocal();
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
      }
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
