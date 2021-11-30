import { Color } from "./dataHelper";
import draculaLight from "./dracula";
import { getText, textId } from "./local";

const themeGrpEl = document.getElementById("theme") as HTMLOptGroupElement;
const themeEl = themeGrpEl.parentElement as HTMLSelectElement;

themeGrpEl.label = getText(textId.theme) + " (PDF)";

interface ITheme {
  color: Color;
  name: string;
}

const themes: { [key: string]: ITheme } = {
  ocean: {
    color: draculaLight.blue,
    name: getText(textId.ocean),
  },
  lime: {
    color: new Color(0x8fc951),
    name: getText(textId.lime),
  },
  magma: {
    color: new Color(0xff3b30),
    name: getText(textId.magma),
  },
};

for (const key in themes) {
  themeGrpEl.appendChild(new Option(themes[key]!.name, key));
}

themeEl.addEventListener("change", () => setTheme(themeEl.value));

let currentTheme: ITheme;

export const setTheme = (theme: keyof typeof themes) => {
  if (typeof theme !== "string" || !(theme in themes)) {
    setTheme("ocean");
    return;
  }

  currentTheme = themes[theme]!;
  localStorage.setItem("theme", theme);
  if (themeEl.value !== theme) {
    themeEl.value = theme;
  }
};

setTheme("ocean");

export const getThemes = () => Object.keys(themes);

export const getThemeId = () => themeEl.value;

export const getTheme = () => currentTheme;
