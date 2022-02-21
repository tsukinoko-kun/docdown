export enum DOMCommand {
  backColor,
  bold,
  contentReadOnly,
  copy,
  createLink,
  cut,
  decreaseFontSize,
  delete,
  enableObjectResizing,
  fontName,
  fontSize,
  foreColor,
  heading,
  hiliteColor,
  increaseFontSize,
  indent,
  insertHorizontalRule,
  insertHTML,
  insertImage,
  insertOrderedList,
  insertUnorderedList,
  insertText,
  italic,
  justifyCenter,
  justifyFull,
  justifyLeft,
  justifyRight,
  outdent,
  paste,
  redo,
  removeFormat,
  selectAll,
  strikeThrough,
  subscript,
  superscript,
  underline,
  undo,
  unlink,
}

const domCommandToString = new Map<DOMCommand, string>([
  [DOMCommand.backColor, "backColor"],
  [DOMCommand.bold, "bold"],
  [DOMCommand.contentReadOnly, "contentReadOnly"],
  [DOMCommand.copy, "copy"],
  [DOMCommand.createLink, "createLink"],
  [DOMCommand.cut, "cut"],
  [DOMCommand.decreaseFontSize, "decreaseFontSize"],
  [DOMCommand.delete, "delete"],
  [DOMCommand.enableObjectResizing, "enableObjectResizing"],
  [DOMCommand.fontName, "fontName"],
  [DOMCommand.fontSize, "fontSize"],
  [DOMCommand.foreColor, "foreColor"],
  [DOMCommand.heading, "heading"],
  [DOMCommand.hiliteColor, "hiliteColor"],
  [DOMCommand.increaseFontSize, "increaseFontSize"],
  [DOMCommand.indent, "indent"],
  [DOMCommand.insertHorizontalRule, "insertHorizontalRule"],
  [DOMCommand.insertHTML, "insertHTML"],
  [DOMCommand.insertImage, "insertImage"],
  [DOMCommand.insertOrderedList, "insertOrderedList"],
  [DOMCommand.insertUnorderedList, "insertUnorderedList"],
  [DOMCommand.insertText, "insertText"],
  [DOMCommand.italic, "italic"],
  [DOMCommand.justifyCenter, "justifyCenter"],
  [DOMCommand.justifyFull, "justifyFull"],
  [DOMCommand.justifyLeft, "justifyLeft"],
  [DOMCommand.justifyRight, "justifyRight"],
  [DOMCommand.outdent, "outdent"],
  [DOMCommand.paste, "paste"],
  [DOMCommand.redo, "redo"],
  [DOMCommand.removeFormat, "removeFormat"],
  [DOMCommand.selectAll, "selectAll"],
  [DOMCommand.strikeThrough, "strikeThrough"],
  [DOMCommand.subscript, "subscript"],
  [DOMCommand.superscript, "superscript"],
  [DOMCommand.underline, "underline"],
  [DOMCommand.undo, "undo"],
  [DOMCommand.unlink, "unlink"],
]);

const copySelection = (): boolean => {
  const selection = window.getSelection();
  if (!selection) {
    return false;
  }

  navigator.clipboard.writeText(selection.toString());
  return true;
};

const replaceSelection = (
  replacer: (
    str: DocumentFragment,
    range: Range
  ) => Node | Promise<Node> | undefined
): boolean => {
  const selection = window.getSelection();
  if (!selection) {
    return false;
  }

  let r = false;

  for (let i = 0; i < selection.rangeCount; i++) {
    const range = selection.getRangeAt(i);
    if (!range) {
      continue;
    }
    const el = range.extractContents();
    const newEl = replacer(el, range);
    if (newEl) {
      if (newEl instanceof Promise) {
        newEl.then((newEl) => {
          range.insertNode(newEl);
        });
      } else {
        range.insertNode(newEl);
      }
    }
    r = true;
  }

  return r;
};

export const execCommand: {
  (
    command:
      | DOMCommand.bold
      | DOMCommand.copy
      | DOMCommand.cut
      | DOMCommand.delete
      | DOMCommand.enableObjectResizing
      | DOMCommand.insertHorizontalRule
      | DOMCommand.insertOrderedList
      | DOMCommand.insertUnorderedList
      | DOMCommand.italic
      | DOMCommand.justifyCenter
      | DOMCommand.justifyFull
      | DOMCommand.justifyLeft
      | DOMCommand.justifyRight
      | DOMCommand.paste
      | DOMCommand.redo
      | DOMCommand.removeFormat
      | DOMCommand.selectAll
      | DOMCommand.strikeThrough
      | DOMCommand.subscript
      | DOMCommand.superscript
      | DOMCommand.underline
      | DOMCommand.undo
      | DOMCommand.unlink
  ): boolean;
  (command: DOMCommand, value: string): boolean;
} = (command: DOMCommand, value: string = ""): boolean => {
  if ("execCommand" in document) {
    const strCommand = domCommandToString.get(command);
    if (strCommand) {
      return document.execCommand(strCommand, false, value);
    }
  }

  switch (command) {
    case DOMCommand.backColor:
      return replaceSelection((el) => {
        const newEl = document.createElement("span");
        newEl.style.backgroundColor = value;
        newEl.appendChild(el);
        return el;
      });
    case DOMCommand.bold:
      return replaceSelection((el) => {
        const newEl = document.createElement("strong");
        newEl.appendChild(el);
        return newEl;
      });
    case DOMCommand.copy:
      return copySelection();
    case DOMCommand.createLink:
      return replaceSelection((el) => {
        const newEl = document.createElement("a");
        newEl.href = value;
        newEl.appendChild(el);
        return newEl;
      });
    case DOMCommand.cut:
      return copySelection() && replaceSelection(() => undefined);
    case DOMCommand.decreaseFontSize:
      return replaceSelection((el) => {
        for (const child of Array.from(el.children)) {
          child.innerHTML = `<span style="font-size: ${value || 0.75}em">${
            child.innerHTML
          }</span>`;
        }
        return el;
      });
    case DOMCommand.delete:
      return replaceSelection(() => undefined);
    case DOMCommand.enableObjectResizing:
      return replaceSelection((el) => {
        for (const child of Array.from(el.children)) {
          (child as HTMLElement).style.resize = value;
        }
        return el;
      });
    case DOMCommand.fontName:
      return replaceSelection((el) => {
        const newEl = document.createElement("span");
        newEl.style.fontFamily = value;
        newEl.appendChild(el);
        return newEl;
      });
    case DOMCommand.fontSize:
      return replaceSelection((el) => {
        const newEl = document.createElement("span");
        newEl.style.fontSize = value;
        newEl.appendChild(el);
        return newEl;
      });
    case DOMCommand.foreColor:
      return replaceSelection((el) => {
        const newEl = document.createElement("span");
        newEl.style.color = value;
        newEl.appendChild(el);
        return newEl;
      });
    case DOMCommand.heading:
      return replaceSelection((el) => {
        if (
          value === "h1" ||
          value === "h2" ||
          value === "h3" ||
          value === "h4" ||
          value === "h5" ||
          value === "h6"
        ) {
          const newEl = document.createElement(value);
          newEl.appendChild(el);
          return newEl;
        } else {
          return el;
        }
      });
    case DOMCommand.hiliteColor:
      return replaceSelection((el) => {
        const newEl = document.createElement("span");
        newEl.style.backgroundColor = value;
        newEl.appendChild(el);
        return newEl;
      });
    case DOMCommand.increaseFontSize:
      return replaceSelection((el) => {
        for (const child of Array.from(el.children)) {
          child.innerHTML = `<span style="font-size: ${value || 1.25}em">${
            child.innerHTML
          }</span>`;
        }
        return el;
      });
    case DOMCommand.indent:
      return replaceSelection((el) => {
        const newEl = document.createElement("div");
        newEl.style.marginLeft = value;
        newEl.appendChild(el);
        return newEl;
      });
    case DOMCommand.insertHorizontalRule:
      return replaceSelection(() => document.createElement("hr"));
    case DOMCommand.insertImage:
      return replaceSelection(() => {
        const newEl = document.createElement("img");
        newEl.src = value;
        return newEl;
      });
    case DOMCommand.insertOrderedList:
      return replaceSelection(() => document.createElement("ol"));
    case DOMCommand.insertUnorderedList:
      return replaceSelection((_, range) => {
        const ul = document.createElement("ul");
        for (const line of Array.from(range.toString().split("\n"))) {
          if (line.trim().length === 0) {
            continue;
          }

          const li = document.createElement("li");
          li.innerText = line;
          ul.appendChild(li);
        }
        return ul;
      });
    case DOMCommand.italic:
      return replaceSelection((el) => {
        const newEl = document.createElement("em");
        newEl.appendChild(el);
        return newEl;
      });
    case DOMCommand.justifyCenter:
      return replaceSelection((el) => {
        const newEl = document.createElement("div");
        newEl.style.textAlign = "center";
        newEl.appendChild(el);
        return newEl;
      });
    case DOMCommand.justifyFull:
      return replaceSelection((el) => {
        const newEl = document.createElement("div");
        newEl.style.textAlign = "justify";
        newEl.appendChild(el);
        return newEl;
      });
    case DOMCommand.justifyLeft:
      return replaceSelection((el) => {
        const newEl = document.createElement("div");
        newEl.style.textAlign = "left";
        newEl.appendChild(el);
        return newEl;
      });
    case DOMCommand.justifyRight:
      return replaceSelection((el) => {
        const newEl = document.createElement("div");
        newEl.style.textAlign = "right";
        newEl.appendChild(el);
        return newEl;
      });
    case DOMCommand.outdent:
      return replaceSelection((el) => {
        const newEl = document.createElement("div");
        newEl.style.marginLeft = "-1em";
        newEl.appendChild(el);
        return newEl;
      });
    case DOMCommand.paste:
      return replaceSelection(async () => {
        return document.createTextNode(
          value || (await navigator.clipboard.readText())
        );
      });

    case DOMCommand.removeFormat:
      return replaceSelection((el) => {
        for (const child of Array.from(el.children)) {
          child.removeAttribute("style");
        }
        return el;
      });
    case DOMCommand.selectAll:
      const range = new Range();
      range.selectNodeContents(document.body);
      const selection = window.getSelection() ?? document.getSelection();
      if (selection) {
        selection.addRange(range);
        return true;
      } else {
        console.error("No selection available");
        return false;
      }
    case DOMCommand.strikeThrough:
      return replaceSelection((el) => {
        const newEl = document.createElement("del");
        newEl.appendChild(el);
        return newEl;
      });
    case DOMCommand.subscript:
      return replaceSelection((el) => {
        const newEl = document.createElement("sub");
        newEl.appendChild(el);
        return newEl;
      });
    case DOMCommand.superscript:
      return replaceSelection((el) => {
        const newEl = document.createElement("sup");
        newEl.appendChild(el);
        return newEl;
      });
    case DOMCommand.underline:
      return replaceSelection((el) => {
        const newEl = document.createElement("u");
        newEl.appendChild(el);
        return newEl;
      });
    case DOMCommand.unlink:
      return replaceSelection((el) => {
        for (const child of Array.from(el.children)) {
          if (child.tagName === "A") {
            child.removeAttribute("href");
          }
        }
        return el;
      });
  }

  return false;
};
