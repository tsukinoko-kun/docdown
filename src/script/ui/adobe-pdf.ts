const pdfView = document.getElementById("pdf-view") as HTMLEmbedElement;

export const previewPdf = (dataUrl: string) => {
  pdfView.src = dataUrl;
  // "https://drive.google.com/viewerng/viewer?embedded=true&url=" + dataUrl;
};
