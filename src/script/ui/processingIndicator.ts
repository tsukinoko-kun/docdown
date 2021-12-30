import { delay } from "@frank-mayer/magic";

const processingIndicator = document.getElementById("indicator") as HTMLElement;

const start = () => {
  processingIndicator.classList.add("processing");
};

const stop = () => {
  processingIndicator.classList.remove("processing");
};

export const indicateProcess = (callback: () => void | Promise<void>) => {
  start();

  const val = callback();

  if (val && val instanceof Promise) {
    Promise.all([val, delay(250 + Math.random() * 500)]).finally(stop);
  } else {
    stop();
  }
};
