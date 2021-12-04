import { userAlert } from "./alert";
import { getText, textId } from "../data/local";
import { listenForMessage, sendMessage, service } from "../router";

export interface IReplaceTextData {
  textEl: HTMLTextAreaElement;
  replacement:
    | string
    | ((selected: string, start: number, end: number) => string);
  insertIfNoSelection?: boolean;
}

listenForMessage(
  service.replaceSelectedText,
  (data: IReplaceTextData): boolean => {
    const start = data.textEl.selectionStart ?? 0;
    const end = data.textEl.selectionEnd ?? start;

    if (!(data.insertIfNoSelection ?? true) && start === end) {
      return false;
    }

    const selected = data.textEl.value.substring(start, end);
    const newText =
      typeof data.replacement === "string"
        ? data.replacement
        : data.replacement(selected, start, end);
    data.textEl.value =
      data.textEl.value.substring(0, start) +
      newText +
      data.textEl.value.substring(end);
    data.textEl.selectionStart = start;
    data.textEl.selectionEnd = start + newText.length;

    sendMessage(service.setChanged, {
      code: data.textEl.value,
    });

    return true;
  }
);

export const textSelected = (textEl: HTMLTextAreaElement): boolean => {
  const start = textEl.selectionStart ?? 0;
  const end = textEl.selectionEnd ?? start;
  return start !== end;
};

export interface IInsertTextData {
  textEl: HTMLTextAreaElement;
  textToInsert: string;
  focusAfterInsert?: boolean;
}

listenForMessage(service.insertText, (data: IInsertTextData) => {
  const textEl = data.textEl;
  const start = textEl.selectionStart ?? 0;
  const end = textEl.selectionEnd ?? start;
  textEl.value =
    textEl.value.substring(0, start) +
    data.textToInsert +
    textEl.value.substring(end);
  if (data.focusAfterInsert ?? true) {
    textEl.selectionStart = start;
    textEl.selectionEnd = start + data.textToInsert.length;
  } else {
    textEl.selectionEnd = textEl.selectionStart =
      start + data.textToInsert.length;
  }

  sendMessage(service.setChanged, {
    code: textEl.value,
  });
});
export const deleteAllSubstringsInText = (
  textEl: HTMLTextAreaElement,
  del: string
) => {
  const start = textEl.selectionStart;
  if (!start) {
    textEl.value = textEl.value.split(del).join("");
    return;
  }

  const end = textEl.selectionEnd ?? start;

  const a = textEl.value.substring(0, start).split(del).join("");
  const b = textEl.value.substring(start, end).split(del).join("");
  const c = textEl.value.substring(end).split(del).join("");

  textEl.value = a + b + c;

  const newStart = a.length;
  const newEnd = newStart + b.length;
  textEl.selectionStart = newStart;
  textEl.selectionEnd = newEnd;

  sendMessage(service.setChanged, {
    code: textEl.value,
  });
};

export interface IReplaceAllSubstringsInTextData {
  textEl: HTMLTextAreaElement;
  searchValue: string | RegExp;
  replaceValue: string;
}
listenForMessage(
  service.replaceAllSubstringsInText,
  (data: IReplaceAllSubstringsInTextData) => {
    const start = data.textEl.selectionStart;
    if (!start) {
      data.textEl.value = data.textEl.value
        .split(data.searchValue)
        .join(data.replaceValue);
      return;
    }

    const end = data.textEl.selectionEnd ?? start;

    const a = data.textEl.value
      .substring(0, start)
      .split(data.searchValue)
      .join(data.replaceValue);
    const b = data.textEl.value
      .substring(start, end)
      .split(data.searchValue)
      .join(data.replaceValue);
    const c = data.textEl.value
      .substring(end)
      .split(data.searchValue)
      .join(data.replaceValue);

    data.textEl.value = a + b + c;

    const newStart = a.length;
    const newEnd = newStart + b.length;
    data.textEl.selectionStart = newStart;
    data.textEl.selectionEnd = newEnd;

    sendMessage(service.setChanged, {
      code: data.textEl.value,
    });
  }
);

type IFindInTextOverloads = {
  (textEl: HTMLTextAreaElement, value: string): void;
  (textEl: HTMLTextAreaElement, value: RegExp): void;
};
export const findInText: IFindInTextOverloads = (
  textEl: HTMLTextAreaElement,
  value: string | RegExp
) => {
  const start = textEl.selectionStart ?? 0;
  const end = textEl.selectionEnd ?? start;
  const selected = textEl.value.substring(start, end);

  if (typeof value === "string") {
    const i =
      value === selected
        ? textEl.value.indexOf(value, end)
        : textEl.value.indexOf(value);

    if (i === -1) {
      userAlert(getText(textId.not_found));
    } else {
      textEl.focus();
      textEl.selectionStart = i;
      textEl.selectionEnd = i + value.length;
    }
  } else {
    const regexExecArr = value.exec(textEl.value);
    if (!regexExecArr || regexExecArr.length === 0) {
      userAlert(getText(textId.not_found));
    } else {
      textEl.focus();
      textEl.selectionStart = regexExecArr.index;
      textEl.selectionEnd = regexExecArr.index + regexExecArr[0]!.length;
    }
  }
};

export const getSelectedText = (textEl: HTMLTextAreaElement): string => {
  const start = textEl.selectionStart ?? 0;
  const end = textEl.selectionEnd ?? start;
  return textEl.value.substring(start, end);
};
