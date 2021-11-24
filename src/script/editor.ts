export const replaceSelectedText = (
  text: HTMLInputElement | HTMLTextAreaElement,
  replacement: (selected: string) => string,
  insertIfNoSelection = true
): boolean => {
  const start = text.selectionStart ?? 0;
  const end = text.selectionEnd ?? start;

  if (!insertIfNoSelection && start === end) {
    return false;
  }

  const selected = text.value.substring(start, end);
  const newText = replacement(selected);
  text.value =
    text.value.substring(0, start) + newText + text.value.substring(end);
  text.selectionStart = start;
  text.selectionEnd = start + newText.length;

  return true;
};

export const insertText = (
  text: HTMLInputElement | HTMLTextAreaElement,
  textToInsert: string
) => {
  const start = text.selectionStart ?? 0;
  const end = text.selectionEnd ?? start;
  const newText =
    text.value.substring(0, start) + textToInsert + text.value.substring(end);
  text.value = newText;
  text.selectionStart = start;
  text.selectionEnd = start + textToInsert.length;
};
