import { SourcesManager } from "../../ui/Source";
import type { sourceId } from "../../ui/Source";
import { mapIterableAllowEmpty } from "../dataHelper";
import type { Content } from "pdfmake/interfaces";
import type { ITuneHelper } from "./TuneHelper";
import { listenForMessage, service } from "../../router";
import { ExportReferences } from "./_exportReferences";

export class TuneSource implements ITuneHelper<Array<sourceId>> {
  public static sourceCounter = new Array<sourceId>();

  public static getUsedSources() {
    return mapIterableAllowEmpty(TuneSource.sourceCounter, (id) =>
      SourcesManager.getSource(id)
    );
  }

  private static sourceIdAppeared(id: sourceId): [number, boolean] {
    const i = TuneSource.sourceCounter.indexOf(id);
    if (i === -1) {
      return [TuneSource.sourceCounter.push(id), true];
    }

    return [i + 1, false];
  }

  fulfillsSchema(name: string, data: any): boolean {
    return name === "source" && Array.isArray(data) && data.length !== 0;
  }

  tune(
    content: Content & { [key: string]: any },
    data: Array<sourceId>
  ): Content {
    const tocInlines = new Array<string>();

    for (const id of data) {
      const s = SourcesManager.getSource(id);
      if (!s) {
        continue;
      }

      const [sourceIndex, sourceIsNew] = TuneSource.sourceIdAppeared(id);

      if (sourceIsNew) {
        ExportReferences.referencesContent.push(
          ExportReferences.formatSourceData(s)
        );
      }

      tocInlines.push(sourceIndex.toString());
    }

    const sourceInline: Content = {
      text: "[" + tocInlines.join(",") + "]",
      style: "src",
      linkToDestination: ExportReferences.id,
    };

    if (content.text) {
      if (Array.isArray(content.text)) {
        content.text.push(sourceInline);
      } else if (typeof content.text === "string") {
        content.text = [content.text, sourceInline];
      }
    }

    return content;
  }
}

listenForMessage(service.prepareExport, () => {
  TuneSource.sourceCounter.length = 0;
});
