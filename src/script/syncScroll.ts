import passive from "./passive";

const codeEl = document.getElementById("code") as HTMLTextAreaElement;
const displayEl = document.getElementById("display") as HTMLDivElement;

let currentScrollEl: Element | undefined = undefined;

const syncScroll = (a: Element, b: Element) => {
  b.scrollTop =
    (b.scrollHeight - b.clientHeight) *
    (a.scrollTop / (a.scrollHeight - a.clientHeight));
};

codeEl.addEventListener("mousemove", () => {
  currentScrollEl = codeEl;
});

displayEl.addEventListener("mousemove", () => {
  currentScrollEl = displayEl;
});

codeEl.addEventListener(
  "scroll",
  () => {
    if (currentScrollEl === codeEl) {
      syncScroll(codeEl, displayEl);
    }
  },
  passive
);

displayEl.addEventListener(
  "scroll",
  () => {
    if (currentScrollEl === displayEl) {
      syncScroll(displayEl, codeEl);
    }
  },
  passive
);
