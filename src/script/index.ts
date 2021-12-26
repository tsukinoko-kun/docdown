export * as router from "./router";
export * as data from "./data";
export * as ui from "./ui";
export * as logic from "./logic";

const removeSplash = () => {
  for (const el of Array.from(document.getElementsByClassName("splash"))) {
    el.remove();
  }
};

const windowLoaded = (window as any).load as Promise<void> | undefined;

if (windowLoaded) {
  windowLoaded.then(() => {
    removeSplash();
  });
} else {
  removeSplash();
}
