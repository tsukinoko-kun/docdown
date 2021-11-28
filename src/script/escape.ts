const htmlEscapes = [
  { expr: /&/g, escaped: "&amp;" },
  { expr: /</g, escaped: "&lt;" },
  { expr: />/g, escaped: "&gt;" },
  { expr: /"/g, escaped: "&quot;" },
  { expr: /'/g, escaped: "&#39;" },
  { expr: /`/g, escaped: "&#96;" },
];
export const escapeHtml = (unsafe: string) => {
  for (const htmlEscape of htmlEscapes) {
    unsafe = unsafe.replace(htmlEscape.expr, htmlEscape.escaped);
  }
  return unsafe;
};

const regExpEscapes = /[-[\]{}()*+?.,\\^$|#\s]/g;
export const escapeRegExp = (unsafe: string) =>
  unsafe.replace(regExpEscapes, "\\$&");
