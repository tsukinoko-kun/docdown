const editorEl = document.getElementById("editor")!;

/**
 * Rich text editor.
 */
export class Paragraph {
  private readonly editorBlockEl: HTMLElement;

  constructor() {
    this.editorBlockEl = document.createElement("p");
    this.editorBlockEl.className = "editor-block";
    this.editorBlockEl.contentEditable = "true";
    this.editorBlockEl.spellcheck = true;
    editorEl.appendChild(this.editorBlockEl);
  }
}
