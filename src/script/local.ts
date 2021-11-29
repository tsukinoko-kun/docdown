export type language = "en" | "de";

type localTextID =
  | "sources"
  | "unknown_source"
  | "author"
  | "title"
  | "creation_date"
  | "last_access"
  | "link"
  | "export_pdf"
  | "download_pdf"
  | "start_new_session"
  | "stop_session"
  | "add_source"
  | "delete_source"
  | "use_source"
  | "last_accessed_at"
  | "find"
  | "replace"
  | "replace_all"
  | "find_and_replace"
  | "not_found"
  | "show_help"
  | "rename_file"
  | "open_local_file"
  | "download_file"
  | "print"
  | "switch_code_render"
  | "toggle_display_render"
  | "zoom_in"
  | "zoom_out"
  | "shortcut"
  | "description"
  | "set_language"
  | "untitled"
  | "unknown"
  | "table_of_contents"
  | "guest_user"
  | "line"
  | "column"
  | "selected"
  | "words";

const localStringMap: { [key in language]: { [key in localTextID]: string } } =
  {
    de: {
      sources: "Quellen",
      unknown_source: "Unbekannte Quelle",
      author: "Autor",
      title: "Titel",
      creation_date: "Erstellungsdatum",
      last_access: "Letzter Zugriff",
      link: "Link",
      export_pdf: "PDF exportieren",
      download_pdf: "PDF herunterladen",
      start_new_session: "Sitzung starten",
      stop_session: "Sitzung beenden",
      add_source: "Quelle hinzufügen",
      delete_source: "Quelle löschen",
      use_source: "Quelle verlinken",
      last_accessed_at: "Zuletzt zugegriffen am",
      find: "Suchen",
      replace: "Ersetzen",
      replace_all: "Alle ersetzen",
      find_and_replace: "Suchen und ersetzen",
      not_found: "Nicht gefunden",
      show_help: "Hilfe anzeigen",
      rename_file: "Datei umbenennen",
      open_local_file: "Lokale Datei öffnen",
      download_file: "Datei herunterladen",
      print: "Drucken",
      switch_code_render: "Wechsle zwischen Code- und Anzeigemodus",
      toggle_display_render:
        "Schalte Anzeigemodus neben Codeanzeige an oder aus",
      zoom_in: "Anzeige vergrößern",
      zoom_out: "Anzeige verkleinern",
      shortcut: "Tastenkürzel",
      description: "Beschreibung",
      set_language: "Sprache ändern",
      untitled: "Unbenannt",
      unknown: "unbekannt",
      table_of_contents: "Inhaltsverzeichnis",
      guest_user: "Gastbenutzer",
      line: "Zeile",
      column: "Spalte",
      selected: "Ausgewählt",
      words: "Wörter",
    },
    en: {
      sources: "Sources",
      unknown_source: "Unknown source",
      author: "Author",
      title: "Title",
      creation_date: "Creation date",
      last_access: "Last access",
      link: "Link",
      export_pdf: "Export to PDF",
      download_pdf: "Download PDF",
      start_new_session: "Start a session",
      stop_session: "Stop session",
      add_source: "Add source",
      delete_source: "Delete source",
      use_source: "Use source",
      last_accessed_at: "Last accessed at",
      find: "Find",
      replace: "Replace",
      replace_all: "Replace all",
      find_and_replace: "Find and replace",
      not_found: "Not found",
      show_help: "Show help",
      rename_file: "Rename file",
      open_local_file: "Open local file",
      download_file: "Download file",
      print: "Print",
      switch_code_render: "Switch between code and display mode",
      toggle_display_render: "Toggle display mode beside code on or off",
      zoom_in: "Zoom in",
      zoom_out: "Zoom out",
      shortcut: "Shortcut",
      description: "Description",
      set_language: "Set language",
      untitled: "Untitled",
      unknown: "unknown",
      table_of_contents: "Table of contents",
      guest_user: "Guest user",
      line: "Line",
      column: "Column",
      selected: "Selected",
      words: "Words",
    },
  };

let currentLanguage: language = navigator.language.includes("de") ? "de" : "en";

export const getLocale = (): language => currentLanguage;

export const setLocale = (language: language): void => {
  if (language in localStringMap) {
    currentLanguage = language;
  } else {
    console.error(`Language ${language} not supported`);
  }
};

export const getLocalizedString = (text: localTextID) =>
  localStringMap[currentLanguage][text];
