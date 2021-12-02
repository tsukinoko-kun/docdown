import {
  addDisposableEventListener,
  disposeNode,
} from "@frank-mayer/magic/bin";
import { userSelect } from "./alert";
import { getText, textId } from "./local";
import passive from "../data/passive";

const repeatTutorialEl = document.getElementById(
  "repeat-tutorial"
) as HTMLElement;

const startTutorial = () => {
  if (document.getElementsByClassName("tutorial").length > 0) {
    return;
  }

  document.body.setAttribute("view-mode", "both");

  repeatTutorialEl.style.display = "none";

  const tutorial = document.createElement("div");
  tutorial.classList.add("tutorial");
  const tutorialText = document.createElement("p");
  tutorial.appendChild(tutorialText);
  document.body.appendChild(tutorial);

  const nextButtonEl = document.createElement("div");
  nextButtonEl.innerText = getText(textId.next);
  nextButtonEl.classList.add("tutorial-next");
  document.body.appendChild(nextButtonEl);

  const tutorialTexts = [
    getText(textId.tutorial_1),
    getText(textId.tutorial_2),
    getText(textId.tutorial_3),
    getText(textId.tutorial_4),
    getText(textId.tutorial_5),
    getText(textId.tutorial_6),
    getText(textId.tutorial_7),
    getText(textId.tutorial_8),
  ];

  addDisposableEventListener(nextButtonEl, "click", () => {
    const nextText = tutorialTexts.shift();

    if (nextText) {
      tutorialText.innerHTML = nextText;
    } else {
      localStorage.setItem("tutorial", "done");
      repeatTutorialEl.style.display = "block";

      disposeNode(nextButtonEl, true);
      disposeNode(tutorial, true);
    }
  });

  tutorialText.innerHTML = tutorialTexts.shift()!;
};

const askToStartTutorial = () => {
  userSelect(
    getText(textId.tutorial_0),
    {
      label: getText(textId.yes),
      value: true,
    },
    {
      label: getText(textId.no),
      value: false,
    }
  )
    .then((value) => {
      if (value) {
        startTutorial();
      } else {
        localStorage.setItem("tutorial", "canceled");
      }
    })
    .catch((err) => {
      if (err) {
        console.info(err);
      }
    });
};

if (localStorage.getItem("tutorial") === null) {
  askToStartTutorial();
}

repeatTutorialEl.addEventListener("click", askToStartTutorial, passive);
