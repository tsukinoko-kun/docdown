import {
  addDisposableEventListener,
  Client,
  nextEventLoop,
  os,
} from "@frank-mayer/magic";

const CMD = (text: string) => {
  return text.replace(/CMD/gi, Client.os === os.mac ? "⌘" : "Ctrl");
};

export const tooltip = (
  el: Element,
  text: string,
  fixed: boolean = false,
  shortcut?: string
) => {
  const rect = el.getBoundingClientRect();

  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height + 14;

  const ttEl = document.createElement("div");
  ttEl.classList.add("ct");
  ttEl.classList.add("ct--bottom");
  ttEl.style.left = `${x}px`;
  ttEl.style.top = `${y}px`;
  ttEl.style.transform = "translateX(-50%)";
  if (fixed) {
    ttEl.style.position = "fixed";
  }

  const contentEl = document.createElement("div");
  contentEl.classList.add("ct__content");
  ttEl.appendChild(contentEl);

  const contentInnerEl = document.createElement("div");
  contentInnerEl.innerText = text;
  contentEl.appendChild(contentInnerEl);

  if (shortcut) {
    const shortcutEl = document.createElement("div");
    shortcutEl.classList.add("ce-toolbar__plus-shortcut");
    shortcutEl.innerText = CMD(shortcut);
    contentInnerEl.appendChild(shortcutEl);
  }

  document.body.appendChild(ttEl);

  addDisposableEventListener(el, "mousemove", () => {
    ttEl.classList.add("ct--shown");
  });

  addDisposableEventListener(el, "mouseout", () => {
    ttEl.classList.remove("ct--shown");
  });
};

// add custom tooltip to all elements
if (windowLoaded) {
  windowLoaded.then(async () => {
    await nextEventLoop();
    document.body.querySelectorAll("[title]").forEach((el) => {
      const title = el.getAttribute("title");
      if (!title) {
        return;
      }

      const shortcut = el.getAttribute("shortcut");

      tooltip(el, title, true, shortcut as string);

      el.removeAttribute("title");
      el.removeAttribute("shortcut");
    });
  });
}
