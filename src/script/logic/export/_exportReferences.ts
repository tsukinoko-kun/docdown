import type { OutputBlockData } from "@editorjs/editorjs";
import type { Content, OrderedListElement } from "pdfmake/interfaces";
import { listenForMessage, service } from "../../router";
import type { IReferencesData, ISourceData } from "../../ui/Source";
import { IExportHelper, wrapEmoji } from "./ExportHelper";

export class ExportReferences implements IExportHelper<IReferencesData> {
  private static s_referencesContent = new Array<OrderedListElement>();

  private static s_id = "toc_references";

  public static get id() {
    return ExportReferences.s_id;
  }

  public static get referencesContent() {
    return ExportReferences.s_referencesContent;
  }

  public fulfillsSchema(
    block: OutputBlockData<string, IReferencesData>
  ): boolean {
    return block.type === "references";
  }

  public parse(block: OutputBlockData<"references", IReferencesData>): Content {
    return [
      {
        text: block.data.title,
        tocItem: "toc",
        tocStyle: "toc_header1",
        style: "header1",
        id: ExportReferences.s_id,
      },
      {
        ol: ExportReferences.s_referencesContent,
      },
    ];
  }

  public static formatSourceData(sourceData: ISourceData) {
    if (sourceData.url) {
      return {
        text: [
          wrapEmoji(
            `${sourceData.author}: ${sourceData.title}, ${sourceData.dateOfAccess}, `
          ),
          { text: wrapEmoji(sourceData.url), style: "anchor" },
        ],
        link: sourceData.url,
        tocItem: ExportReferences.s_id,
      };
    } else {
      return {
        text: wrapEmoji(
          `${sourceData.author}: ${sourceData.title}, ${sourceData.dateOfAccess}`
        ),
        tocItem: ExportReferences.s_id,
      };
    }
  }
}

listenForMessage(service.prepareExport, () => {
  ExportReferences.referencesContent.length = 0;
});
