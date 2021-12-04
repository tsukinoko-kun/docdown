import { Color } from "../data/Color";
import draculaLight from "../data/dracula";
import { getText, textId } from "../data/local";
import { listenForMessage, sendMessage, service } from "../router";

const themeGrpEl = document.getElementById("theme") as HTMLOptGroupElement;
const themeEl = themeGrpEl.parentElement as HTMLSelectElement;

themeGrpEl.label = getText(textId.theme) + " (PDF)";

export interface ITheme {
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

export type themeId = keyof typeof themes;

for (const key in themes) {
  themeGrpEl.appendChild(new Option(themes[key]!.name, key));
}

themeEl.addEventListener("change", () => setTheme(themeEl.value));

let currentTheme: ITheme;

const setTheme = (theme: themeId) => {
  if (typeof theme !== "string" || !(theme in themes)) {
    setTheme("ocean");
    return;
  }

  currentTheme = themes[theme]!;
  localStorage.setItem("theme", theme);
  if (themeEl.value !== theme) {
    themeEl.value = theme;
  }

  sendMessage(service.setChanged, {
    theme,
  });
};

setTheme("ocean");

listenForMessage(service.setTheme, setTheme);

export const getThemes = () => Object.keys(themes);

export const getThemeId = () => themeEl.value;

listenForMessage(service.getThemes, () => Object.keys(themes));
listenForMessage(service.getThemeId, () => themeEl.value);
listenForMessage(service.getTheme, () => currentTheme);
