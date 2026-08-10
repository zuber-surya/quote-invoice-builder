import { renderToBuffer } from "@react-pdf/renderer";
import { QuotePdfDocument, type QuotePdfData } from "./quote-pdf-document";

export async function generateQuotePdf(data: QuotePdfData): Promise<Buffer> {
  return renderToBuffer(<QuotePdfDocument data={data} />);
}
