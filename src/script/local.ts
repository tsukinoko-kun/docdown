export type language = "en" | "de";

interface ILanguageMap {
  sources: string;
  unknown_source: string;
  author: string;
  title: string;
  creation_date: string;
  last_access: string;
  link: string;
  export_pdf: string;
  start_new_session: string;
  stop_session: string;
  add_source: string;
  delete_source: string;
  use_source: string;
  last_accessed_at: string;
  find: string;
  replace: string;
  replace_all: string;
  find_and_replace: string;
  not_found: string;
  show_help: string;
  rename_file: string;
  open_local_file: string;
  download_file: string;
  print: string;
  switch_code_render: string;
  toggle_display_render: string;
  zoom_in: string;
  zoom_out: string;
  shortcut: string;
  description: string;
  set_language: string;
  untitled: string;
  unknown: string;
}

const localStringMap: { [key in language]: ILanguageMap } = {
  de: {
    sources: "Quellen",
    unknown_source: "Unbekannte Quelle",
    author: "Autor",
    title: "Titel",
    creation_date: "Erstellungsdatum",
    last_access: "Letzter Zugriff",
    link: "Link",
    export_pdf: "PDF exportieren",
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
    toggle_display_render: "Schalte Anzeigemodus neben Codeanzeige an oder aus",
    zoom_in: "Anzeige vergrößern",
    zoom_out: "Anzeige verkleinern",
    shortcut: "Tastenkürzel",
    description: "Beschreibung",
    set_language: "Sprache ändern",
    untitled: "Unbenannt",
    unknown: "unbekannt",
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

export const getLocalizedString = (text: keyof ILanguageMap) =>
  localStringMap[currentLanguage][text];
