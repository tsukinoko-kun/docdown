type language = "en" | "de";

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
  last_accessed_at: string;
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
    start_new_session: "Neue Sitzung starten",
    stop_session: "Sitzung beenden",
    add_source: "Quelle hinzufügen",
    delete_source: "Quelle löschen",
    last_accessed_at: "Zuletzt zugegriffen am",
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
    start_new_session: "Start new session",
    stop_session: "Stop session",
    add_source: "Add source",
    delete_source: "Delete source",
    last_accessed_at: "Last accessed at",
  },
};

const currentLanguage: language = "de";

export const getLocale = (): language => currentLanguage;

export const getLocalizedString = (text: keyof ILanguageMap) =>
  localStringMap[currentLanguage][text];
