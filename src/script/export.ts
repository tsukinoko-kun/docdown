import { context } from "./context";
import html2pdf from "html2pdf.js";
import { getLocalizedString } from "./local";
import { getTitle } from "./session";

const pdf = html2pdf().set({
  margin: 1,
  jsPDF: { unit: "cm", format: "A4", orientation: "portrait" },
});

const screen = document.querySelector(
  'link[rel="stylesheet"][media="screen"]'
) as HTMLLinkElement;
const print = document.querySelector(
  'link[rel="stylesheet"][media="print"]'
) as HTMLLinkElement;
const printMode = (value: boolean) => {
  screen.disabled = value;
  print.media = value ? "all" : "print";
};

const displayEl = document.getElementById("display") as HTMLDivElement;

displayEl.addEventListener(
  "contextmenu",
  (ev) => {
    ev.preventDefault();

    context(ev, [
      {
        label: getLocalizedString("export_pdf"),
        action: () => {
          printMode(true);
          setTimeout(() => {
            pdf.from(displayEl).save(getTitle() + ".pdf");
            setTimeout(() => {
              printMode(false);
            }, 200);
          }, 100);
        },
      },
    ]);
  },
  {
    passive: false,
    capture: true,
  }
);
