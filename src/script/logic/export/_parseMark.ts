import type { Content } from "pdfmake/interfaces";

export const parseMark = (text: string): Content => {
  const tempHtml = document.createElement("div");
  tempHtml.innerHTML = text;

  const content = new Array<Content>();

  for (const el of Array.from(tempHtml.childNodes)) {
    if (el.textContent) {
      if (
        el.nodeType === Node.ELEMENT_NODE &&
        (el as Element).tagName === "MARK" &&
        (el as Element).classList.contains("cdx-marker")
      ) {
        content.push({ text: (el as HTMLElement).innerText, style: "mark" });
      } else {
        content.push({ text: el.textContent });
      }
    }
  }

  console.debug(content);

  return content;
};
