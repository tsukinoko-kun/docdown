import { addDisposableEventListener, Client, os } from "@frank-mayer/magic";

export enum Shortcut {
  shift,
  alt,
  ctrl,
}

const shortcutRegister = new Array<KeyBind>();

document.addEventListener(
  "keypress",
  (ev) => {
    for (const shortcut of shortcutRegister) {
      if (shortcut.isShortcut(ev)) {
        if (!ev.defaultPrevented) {
          ev.preventDefault();
        }

        shortcut.callback();
      }
    }
  },
  {
    passive: false,
  }
);

export class KeyBind {
  private readonly key: string;
  private readonly shortcut: Array<Shortcut> = [Shortcut.ctrl];
  public readonly callback: () => void;

  constructor(key: string, shortcut: Array<Shortcut>, callback: () => void) {
    this.key = key.toUpperCase();
    this.shortcut = shortcut;
    this.callback = callback;
    shortcutRegister.push(this);
  }

  public isShortcut(ev: KeyboardEvent): boolean {
    return (
      ev.key === this.key &&
      this.shortcut.includes(Shortcut.shift) === ev.shiftKey
    );
  }

  toString(): string {
    const text = new Array<string>();

    for (const el of this.shortcut) {
      switch (el) {
        case Shortcut.shift:
          text.push(Client.os === os.mac ? "⌥" : "⇧");
          break;
        case Shortcut.alt:
          text.push("Alt");
          break;
        case Shortcut.ctrl:
          text.push(Client.os === os.mac ? "⌘" : "Ctrl");
          break;
      }
    }

    text.push(this.key);

    return text.join(" + ");
  }
}

export const tooltip = (
  el: Element,
  text: string,
  fixed: boolean = false,
  shortcut?: KeyBind
) => {
  const tooltipEl = document.createElement("div");
  tooltipEl.classList.add("tooltip");
  tooltipEl.style.position = fixed ? "fixed" : "absolute";
  tooltipEl.style.display = "none";

  const textEl = document.createElement("span");
  textEl.innerText = text;
  tooltipEl.appendChild(textEl);

  if (shortcut) {
    const shortcutEl = document.createElement("span");
    shortcutEl.innerText = shortcut.toString();
    tooltipEl.appendChild(shortcutEl);
  }

  document.body.appendChild(tooltipEl);

  addDisposableEventListener(
    el,
    "mousemove",
    () => {
      const rect = el.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height;
      tooltipEl.style.left = `${x}px`;
      tooltipEl.style.top = `${y}px`;

      tooltipEl.style.display = "block";
    },
    {
      passive: true,
    }
  );

  addDisposableEventListener(
    el,
    "mouseout",
    () => {
      tooltipEl.style.display = "none";
    },
    {
      passive: true,
    }
  );
};
