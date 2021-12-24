import { html, addDisposableEventListener } from "@frank-mayer/magic";

export const tooltip = (el: Element, text: string) => {
  const rect = el.getBoundingClientRect();

  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height + 14;

  const tt = html`<div
    class="ct ct--bottom ct--shown"
    style="left: ${x}px; top: ${y}px; transform: translateX(-50%)"
  >
    <div class="ct__content">
      <div>
        ${text}
        <!-- <div class="ce-toolbar__plus-shortcut">⇥ Tab</div> -->
      </div>
    </div>
  </div>`[0]!;

  addDisposableEventListener(el, "mousemove", () => {
    document.body.appendChild(tt);
  });

  addDisposableEventListener(el, "mouseout", () => {
    if (tt.parentElement === document.body) {
      document.body.removeChild(tt);
    }
  });
};

// add custom tooltip to all elements
document.body.querySelectorAll("[title]").forEach((el) => {
  tooltip(el, (el as HTMLElement).title);
  el.removeAttribute("title");
});
