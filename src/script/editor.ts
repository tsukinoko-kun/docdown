import { alert } from "./alert";
import { getLocalizedString } from "./local";

export const replaceSelectedText = (
  textEl: HTMLTextAreaElement,
  replacement: (selected: string, start: number, end: number) => string,
  insertIfNoSelection = true
): boolean => {
  const start = textEl.selectionStart ?? 0;
  const end = textEl.selectionEnd ?? start;

  if (!insertIfNoSelection && start === end) {
    return false;
  }

  const selected = textEl.value.substring(start, end);
  const newText = replacement(selected, start, end);
  textEl.value =
    textEl.value.substring(0, start) + newText + textEl.value.substring(end);
  textEl.selectionStart = start;
  textEl.selectionEnd = start + newText.length;

  return true;
};

export const textSelected = (textEl: HTMLTextAreaElement): boolean => {
  const start = textEl.selectionStart ?? 0;
  const end = textEl.selectionEnd ?? start;
  return start !== end;
};

export const insertText = (
  textEl: HTMLTextAreaElement,
  textToInsert: string,
  focusAfterInsert = true
) => {
  const start = textEl.selectionStart ?? 0;
  const end = textEl.selectionEnd ?? start;
  textEl.value =
    textEl.value.substring(0, start) +
    textToInsert +
    textEl.value.substring(end);
  if (focusAfterInsert) {
    textEl.selectionStart = start;
    textEl.selectionEnd = start + textToInsert.length;
  } else {
    textEl.selectionEnd = textEl.selectionStart = start + textToInsert.length;
  }
};

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
};

export const replaceAllSubstringsInText = (
  textEl: HTMLTextAreaElement,
  searchValue: string,
  replaceValue: string
) => {
  const start = textEl.selectionStart;
  if (!start) {
    textEl.value = textEl.value.split(searchValue).join(replaceValue);
    return;
  }

  const end = textEl.selectionEnd ?? start;

  const a = textEl.value
    .substring(0, start)
    .split(searchValue)
    .join(replaceValue);
  const b = textEl.value
    .substring(start, end)
    .split(searchValue)
    .join(replaceValue);
  const c = textEl.value.substring(end).split(searchValue).join(replaceValue);

  textEl.value = a + b + c;

  const newStart = a.length;
  const newEnd = newStart + b.length;
  textEl.selectionStart = newStart;
  textEl.selectionEnd = newEnd;
};

export const findInText = (textEl: HTMLTextAreaElement, value: string) => {
  const start = textEl.selectionStart ?? 0;
  const end = textEl.selectionEnd ?? start;
  const selected = textEl.value.substring(start, end);

  const i =
    value === selected
      ? textEl.value.indexOf(value, end)
      : textEl.value.indexOf(value);

  if (i === -1) {
    alert(getLocalizedString("not_found"));
  } else {
    textEl.focus();
    textEl.selectionStart = i;
    textEl.selectionEnd = i + value.length;
  }
};

export const getSelectedText = (textEl: HTMLTextAreaElement): string => {
  const start = textEl.selectionStart ?? 0;
  const end = textEl.selectionEnd ?? start;
  return textEl.value.substring(start, end);
};
