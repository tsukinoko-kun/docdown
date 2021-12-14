import { defaultStyle, fonts, styles } from "../../data/pdfStylesheet";
import { createPdf as pdfmakeCreatePdf } from "pdfmake/build/pdfmake";
import { listenForMessage, sendMessage, service } from "../../router";
import { centimeterToPoint, mapIterableAllowEmpty } from "../dataHelper";

import type { IExportHelper } from "./ExportHelper";
import { ExportHeader } from "./_exportHeader";
import { ExportList } from "./_exportList";
import { ExportParagraph } from "./_exportParagraph";
import { ExportTable } from "./_exportTable";
import { ExportQuote } from "./_exportQuote";
import { ExportCodeBox } from "./_exportCode";
import { ExportTableOfContents } from "./_exportTableOfContents";

import type { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import type { OutputBlockData, OutputData } from "@editorjs/editorjs";

const exportHelpers: Array<IExportHelper<any>> = [
  new ExportParagraph(),
  new ExportHeader(),
  new ExportList(),
  new ExportTable(),
  new ExportQuote(),
  new ExportCodeBox(),
  new ExportTableOfContents(),
];

const mapOutputBlockToPdfContent = (
  el: OutputBlockData<string, any>
): Content | undefined => {
  for (const helper of exportHelpers) {
    if (helper.fulfillsSchema(el)) {
      return helper.parse(el);
    }
  }

  console.error(`No export helper found for ${el.type}`);
  return undefined;
};

const createDocDefinition = (outputData: OutputData): TDocumentDefinitions => ({
  info: {
    creationDate: new Date(),
  },
  defaultStyle,
  styles: styles(),
  pageMargins: centimeterToPoint<[number, number]>([3.5, 2.5]),
  header: {
    text: new Date().toLocaleDateString(sendMessage(service.getLocale)),
    margin: centimeterToPoint<[number, number]>([3.5, 0.5]),
    opacity: 0.5,
  },
  content: mapIterableAllowEmpty(outputData.blocks, mapOutputBlockToPdfContent),
  footer: (currentPage, pageCount) => ({
    text: `${currentPage}/${pageCount}`,
    alignment: "right",
    margin: [40, 20],
    opacity: 0.5,
  }),
  compress: true,
  pageSize: "A4",
  pageOrientation: "portrait",
  permissions: {
    annotating: true,
    contentAccessibility: true,
    documentAssembly: true,
    copying: true,
    modifying: false,
  },
});

const createPdf = async () => {
  const data = await sendMessage(service.getDocumentData);
  if (data) {
    return pdfmakeCreatePdf(createDocDefinition(data), undefined, fonts);
  } else {
    throw new Error("No data");
  }
};

export enum pdfOutput {
  print,
  download,
  open,
}

listenForMessage(service.createPdf, (output) => {
  switch (output) {
    case pdfOutput.print:
      createPdf()
        .then((x) => x.print())
        .catch(console.error);
      break;
    case pdfOutput.download:
      createPdf()
        .then((x) => x.download())
        .catch(console.error);
      break;
    case pdfOutput.open:
      createPdf()
        .then((x) => x.open())
        .catch(console.error);
      break;
  }
});
