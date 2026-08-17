import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { amountInWords } from "./amount-in-words";

// docs/Product Requirements Document.md sections 17 (PDF content contract,
// quote-equivalent) and 23 (invoice/payment fields). Rendered server-side only
// (see api/v1/invoices/[id]/pdf/route.ts); never imported from a client
// component. Mirrors lib/pdf/quote-pdf-document.tsx, adding a status line and
// a paid/remaining breakdown below the totals.
//
// Layout (bordered header box with a FROM/TO left column and an INVOICE
// NO/DATE/export-declaration right column, a boxed item table whose footer
// carries the totals, and a separate bank-details box) follows a reference
// invoice the business owner supplied — see docs/Architecture Decisions.md
// for context. PRIMARY_COLOR is the app's terracotta brand color
// (design-system/quote-invoice-builder/MASTER.md — `oklch(0.55 0.14 45)`,
// converted to sRGB hex since react-pdf doesn't support oklch).
const PRIMARY_COLOR = "#b2511e";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, color: "#18181b", fontFamily: "Helvetica" },
  logo: { width: 56, height: 56, objectFit: "contain", marginBottom: 6 },
  muted: { color: "#71717a" },
  label: {
    fontSize: 8,
    color: PRIMARY_COLOR,
    textTransform: "uppercase",
    fontWeight: 700,
    marginBottom: 2,
  },
  bold: { fontWeight: 700 },
  sectionLabel: { fontSize: 8, color: "#71717a", textTransform: "uppercase", marginBottom: 3 },
  docKicker: { fontSize: 10, fontWeight: 700, color: PRIMARY_COLOR, letterSpacing: 1, marginBottom: 6 },
  status: { fontSize: 9, fontWeight: 700, marginTop: 4, color: PRIMARY_COLOR },

  headerBox: { flexDirection: "row", border: "1pt solid #d4d4d8", borderRadius: 6 },
  headerColLeft: { width: "58%" },
  headerColRight: { width: "42%", borderLeft: "1pt solid #d4d4d8" },
  headerBlock: { padding: 10 },
  headerBlockBordered: { padding: 10, borderTop: "1pt solid #d4d4d8" },
  headerMetaRow: { flexDirection: "row", gap: 24 },

  exportText: { fontSize: 8, color: "#71717a", lineHeight: 1.4 },

  table: { marginTop: 20, border: "1pt solid #d4d4d8", borderRadius: 6 },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottom: "1pt solid #d4d4d8",
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1pt solid #f4f4f5",
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  th: { fontSize: 8, color: PRIMARY_COLOR, textTransform: "uppercase", fontWeight: 700 },
  colAmount: { width: "14%", textAlign: "right" },

  tableFooter: { borderTop: "1pt solid #d4d4d8" },
  footerRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 10, paddingVertical: 4 },
  footerTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTop: "1pt solid #d4d4d8",
    fontSize: 12,
    fontWeight: 700,
  },
  footerWordsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderTop: "1pt solid #f4f4f5",
  },
  footerWordsLabel: { fontSize: 8, color: PRIMARY_COLOR, textTransform: "uppercase", fontWeight: 700 },
  footerWordsValue: { fontSize: 9, color: "#71717a" },
  footerPaymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderTop: "1pt solid #f4f4f5",
  },

  bankCard: { marginTop: 16, border: "1pt solid #d4d4d8", borderRadius: 6, padding: 10, width: "48%" },
  bankRow: { flexDirection: "row", paddingVertical: 2 },
  bankLabel: { width: 110, fontSize: 8, color: "#71717a", textTransform: "uppercase" },
  bankColon: { width: 10, color: "#71717a" },
  bankValue: { fontWeight: 700 },
  footer: { marginTop: 24, borderTop: "1pt solid #e4e4e7", paddingTop: 10 },
});

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  UNPAID: "Unpaid",
  PARTIALLY_PAID: "Partially Paid",
  PAID: "Paid",
};

// Data arrives as YYYY-MM-DD (lib/format-decimal.ts-adjacent date convention
// used across the API); the reference invoice uses DD-MM-YYYY.
function formatDateDDMMYYYY(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}-${month}-${year}`;
}

type Party = {
  name: string;
  companyName?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  email?: string | null;
  phone?: string | null;
  taxNumber?: string | null;
};

type BusinessPdfData = Party & {
  logoUrl?: string | null;
  bankAccountName?: string | null;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  ifscCode?: string | null;
  swiftBicCode?: string | null;
  lutNumber?: string | null;
  lutDate?: string | null;
  pdfShowQuantity: boolean;
  pdfShowUnitPrice: boolean;
  pdfShowDiscount: boolean;
  pdfShowTax: boolean;
  pdfShowSacCode: boolean;
  currency: string;
};

type InvoicePdfItem = {
  name: string;
  description: string | null;
  unit: string;
  sacCode: string | null;
  quantity: string;
  unitPrice: string;
  discountAmount: string;
  taxRate: string;
  lineTotal: string;
};

export type InvoicePdfData = {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string | null;
  status: string;
  items: InvoicePdfItem[];
  subtotal: string;
  discountAmount: string;
  taxAmount: string;
  totalAmount: string;
  paidAmount: string;
  remainingAmount: string;
  notes: string | null;
  terms: string | null;
  business: BusinessPdfData;
  customer: Party;
};

function addressLines(party: Party): string[] {
  const cityLine = [party.city, party.state, party.postalCode].filter(Boolean).join(", ");
  return [party.address, cityLine, party.country].filter((line): line is string => Boolean(line));
}

// Optional item-table columns, toggled per business via BusinessProfile
// pdfShow* flags. Item and Amount columns are always shown. The remaining
// table width (52%, matching the original fixed qty/price/discount/tax
// layout) is split evenly across whichever optional columns are visible; if
// none are visible, the Item column absorbs the freed width.
const OPTIONAL_TABLE_WIDTH = 52;
const ITEM_BASE_WIDTH = 34;

type OptionalColumn = {
  key: string;
  label: string;
  visible: boolean;
  render: (item: InvoicePdfItem) => string;
};

function buildOptionalColumns(business: BusinessPdfData): OptionalColumn[] {
  return [
    { key: "sacCode", label: "SAC Code", visible: business.pdfShowSacCode, render: (item) => item.sacCode ?? "" },
    {
      key: "quantity",
      label: "Qty",
      visible: business.pdfShowQuantity,
      render: (item) => `${item.quantity} ${item.unit}`,
    },
    { key: "unitPrice", label: "Unit Price", visible: business.pdfShowUnitPrice, render: (item) => item.unitPrice },
    {
      key: "discount",
      label: "Discount",
      visible: business.pdfShowDiscount,
      render: (item) => item.discountAmount,
    },
    { key: "tax", label: "Tax", visible: business.pdfShowTax, render: (item) => `${item.taxRate}%` },
  ];
}

export function InvoicePdfDocument({ data }: { data: InvoicePdfData }) {
  const optionalColumns = buildOptionalColumns(data.business);
  const visibleOptionalColumns = optionalColumns.filter((col) => col.visible);
  const optionalColumnWidth =
    visibleOptionalColumns.length > 0 ? OPTIONAL_TABLE_WIDTH / visibleOptionalColumns.length : 0;
  const itemWidth = visibleOptionalColumns.length > 0 ? ITEM_BASE_WIDTH : ITEM_BASE_WIDTH + OPTIONAL_TABLE_WIDTH;

  const hasBankDetails = Boolean(
    data.business.bankAccountName ||
      data.business.bankName ||
      data.business.bankAccountNumber ||
      data.business.ifscCode ||
      data.business.swiftBicCode
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.docKicker}>INVOICE</Text>

        <View style={styles.headerBox}>
          <View style={styles.headerColLeft}>
            <View style={styles.headerBlock}>
              {data.business.logoUrl && (
                // react-pdf's Image is a PDF primitive, not an HTML <img> — no alt prop.
                // eslint-disable-next-line jsx-a11y/alt-text
                <Image src={data.business.logoUrl} style={styles.logo} />
              )}
              <Text style={styles.label}>From</Text>
              <Text style={styles.bold}>{data.business.name}</Text>
              {data.business.taxNumber && <Text style={styles.muted}>GST - {data.business.taxNumber}</Text>}
              {addressLines(data.business).map((line, i) => (
                <Text key={i} style={styles.muted}>
                  {line}
                </Text>
              ))}
            </View>
            <View style={styles.headerBlockBordered}>
              <Text style={styles.label}>To</Text>
              <Text style={styles.bold}>{data.customer.name}</Text>
              {data.customer.companyName && <Text style={styles.muted}>{data.customer.companyName}</Text>}
              {data.customer.phone && <Text style={styles.muted}>Number - {data.customer.phone}</Text>}
              {data.customer.email && <Text style={styles.muted}>Email id - {data.customer.email}</Text>}
            </View>
          </View>

          <View style={styles.headerColRight}>
            <View style={styles.headerBlock}>
              <Text style={styles.label}>Invoice No:</Text>
              <Text style={styles.bold}>{data.invoiceNumber}</Text>
            </View>
            <View style={styles.headerBlockBordered}>
              <Text style={styles.label}>Date (DD-MM-YYYY):</Text>
              <Text style={styles.bold}>{formatDateDDMMYYYY(data.invoiceDate)}</Text>
              {data.dueDate && <Text style={styles.muted}>Due: {formatDateDDMMYYYY(data.dueDate)}</Text>}
              <Text style={styles.status}>{STATUS_LABELS[data.status] ?? data.status}</Text>
            </View>
            {data.business.lutNumber && (
              <View style={styles.headerBlockBordered}>
                <Text style={styles.exportText}>
                  SUPPLY MEANT FOR EXPORT/SUPPLY TO SEZ UNIT OR SEZ DEVELOPER FOR AUTHORISED OPERATIONS UNDER BOND OR
                  LETTER OF UNDERTAKING WITHOUT PAYMENT OF IGST
                </Text>
                <View style={[styles.headerMetaRow, { marginTop: 6 }]}>
                  <View>
                    <Text style={styles.label}>LUT No.</Text>
                    <Text style={styles.bold}>{data.business.lutNumber}</Text>
                  </View>
                  {data.business.lutDate && (
                    <View>
                      <Text style={styles.label}>LUT Date</Text>
                      <Text style={styles.bold}>{formatDateDDMMYYYY(data.business.lutDate)}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.th, { width: `${itemWidth}%` }]}>Description</Text>
            {visibleOptionalColumns.map((col) => (
              <Text key={col.key} style={[styles.th, { width: `${optionalColumnWidth}%`, textAlign: "right" }]}>
                {col.label}
              </Text>
            ))}
            <Text style={[styles.th, styles.colAmount]}>Total</Text>
          </View>
          {data.items.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <View style={{ width: `${itemWidth}%` }}>
                <Text>{item.name}</Text>
                {item.description && <Text style={styles.muted}>{item.description}</Text>}
              </View>
              {visibleOptionalColumns.map((col) => (
                <Text key={col.key} style={{ width: `${optionalColumnWidth}%`, textAlign: "right" }}>
                  {col.render(item)}
                </Text>
              ))}
              <Text style={styles.colAmount}>{item.lineTotal}</Text>
            </View>
          ))}

          <View style={styles.tableFooter}>
            <View style={styles.footerRow}>
              <Text style={styles.muted}>Subtotal</Text>
              <Text>{data.subtotal}</Text>
            </View>
            <View style={styles.footerRow}>
              <Text style={styles.muted}>Discount</Text>
              <Text>{data.discountAmount}</Text>
            </View>
            <View style={styles.footerRow}>
              <Text style={styles.muted}>Tax</Text>
              <Text>{data.taxAmount}</Text>
            </View>
            <View style={styles.footerTotalRow}>
              <Text>Total</Text>
              <Text>{data.totalAmount}</Text>
            </View>
            <View style={styles.footerWordsRow}>
              <Text style={styles.footerWordsLabel}>Total (in words)</Text>
              <Text style={styles.footerWordsValue}>{amountInWords(data.totalAmount, data.business.currency)}</Text>
            </View>
            <View style={styles.footerPaymentRow}>
              <Text style={styles.muted}>Paid</Text>
              <Text>{data.paidAmount}</Text>
            </View>
            <View style={styles.footerPaymentRow}>
              <Text style={styles.bold}>Balance Due</Text>
              <Text style={styles.bold}>{data.remainingAmount}</Text>
            </View>
          </View>
        </View>

        {hasBankDetails && (
          <View style={styles.bankCard}>
            <Text style={styles.label}>Payment Bank Details</Text>
            {data.business.bankAccountName && (
              <View style={styles.bankRow}>
                <Text style={styles.bankLabel}>A/C Name</Text>
                <Text style={styles.bankColon}>:</Text>
                <Text style={styles.bankValue}>{data.business.bankAccountName}</Text>
              </View>
            )}
            {data.business.bankName && (
              <View style={styles.bankRow}>
                <Text style={styles.bankLabel}>Bank Name</Text>
                <Text style={styles.bankColon}>:</Text>
                <Text style={styles.bankValue}>{data.business.bankName}</Text>
              </View>
            )}
            {data.business.bankAccountNumber && (
              <View style={styles.bankRow}>
                <Text style={styles.bankLabel}>A/C No</Text>
                <Text style={styles.bankColon}>:</Text>
                <Text style={styles.bankValue}>{data.business.bankAccountNumber}</Text>
              </View>
            )}
            {data.business.ifscCode && (
              <View style={styles.bankRow}>
                <Text style={styles.bankLabel}>IFSC Code</Text>
                <Text style={styles.bankColon}>:</Text>
                <Text style={styles.bankValue}>{data.business.ifscCode}</Text>
              </View>
            )}
            {data.business.swiftBicCode && (
              <View style={styles.bankRow}>
                <Text style={styles.bankLabel}>SWIFT/BIC Code</Text>
                <Text style={styles.bankColon}>:</Text>
                <Text style={styles.bankValue}>{data.business.swiftBicCode}</Text>
              </View>
            )}
          </View>
        )}

        {(data.notes || data.terms) && (
          <View style={styles.footer}>
            {data.notes && (
              <View style={{ marginBottom: 8 }}>
                <Text style={styles.sectionLabel}>Notes</Text>
                <Text>{data.notes}</Text>
              </View>
            )}
            {data.terms && (
              <View style={{ marginBottom: 8 }}>
                <Text style={styles.sectionLabel}>Terms & Conditions</Text>
                <Text>{data.terms}</Text>
              </View>
            )}
            <Text style={styles.muted}>Thank you for your business.</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}
