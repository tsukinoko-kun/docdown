import { DOMCommand, execCommand } from "../execCommand";
import { KeyBind, Shortcut, tooltip } from "../tooltip";

export class Toolbar {
  private readonly toolbarEl: HTMLElement;

  constructor() {
    this.toolbarEl = document.getElementById("toolbar")!;

    this.init();
  }

  private init() {
    this.toolbarEl.appendChild(
      this.button("Bold", "b", [Shortcut.ctrl], () => {
        execCommand(DOMCommand.bold);
      })
    );
    this.toolbarEl.appendChild(
      this.button("Italic", "i", [Shortcut.ctrl], () => {
        execCommand(DOMCommand.italic);
      })
    );
    this.toolbarEl.appendChild(
      this.button("Underline", "u", [Shortcut.ctrl], () => {
        execCommand(DOMCommand.underline);
      })
    );
    this.toolbarEl.appendChild(
      this.button("Strike", () => {
        execCommand(DOMCommand.strikeThrough);
      })
    );
    this.toolbarEl.appendChild(
      this.button("Link", "k", [Shortcut.ctrl], () => {
        const url = prompt("Enter the URL");
        if (url) {
          execCommand(DOMCommand.createLink, url);
        }
      })
    );
    this.toolbarEl.appendChild(
      this.button("Unlink", () => {
        execCommand(DOMCommand.unlink);
      })
    );
  }

  private button(title: string, callback: () => void): HTMLElement;

  private button(
    title: string,
    key: string,
    shortcut: Array<Shortcut>,
    callback: () => void
  ): HTMLElement;

  private button(
    title: string,
    keyOrCallback: string | (() => void),
    shortcut?: Array<Shortcut>,
    callback?: () => void
  ): HTMLElement {
    const el = document.createElement("span");
    el.className = "button";
    el.innerText = title;
    if (typeof keyOrCallback === "function") {
      el.addEventListener("click", keyOrCallback);
      tooltip(el, title, true);
    } else if (typeof keyOrCallback === "string" && shortcut && callback) {
      tooltip(el, title, true, new KeyBind(keyOrCallback, shortcut, callback));
      el.addEventListener("click", callback);
    }
    return el;
  }
}
