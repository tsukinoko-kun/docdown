export * as router from "./router";
export * as ui from "./ui";
export * as logic from "./logic";

const removeSplash = () => {
  for (const el of Array.from(document.getElementsByClassName("splash"))) {
    el.remove();
  }
};

if (windowLoaded) {
  windowLoaded.then(() => {
    removeSplash();
  });
} else {
  removeSplash();
}
