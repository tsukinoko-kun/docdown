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

export const textSelected = (text: HTMLTextAreaElement): boolean => {
  const start = text.selectionStart ?? 0;
  const end = text.selectionEnd ?? start;
  return start !== end;
};

export const insertText = (
  text: HTMLTextAreaElement,
  textToInsert: string,
  focusAfterInsert = true
) => {
  const start = text.selectionStart ?? 0;
  const end = text.selectionEnd ?? start;
  text.value =
    text.value.substring(0, start) + textToInsert + text.value.substring(end);
  if (focusAfterInsert) {
    text.selectionStart = start;
    text.selectionEnd = start + textToInsert.length;
  } else {
    text.selectionEnd = text.selectionStart = start + textToInsert.length;
  }
};
