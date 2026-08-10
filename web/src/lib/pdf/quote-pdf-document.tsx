import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";

// docs/Product Requirements Document.md section 17 — exact PDF content contract.
// Rendered server-side only (see api/v1/quotes/[id]/pdf/route.ts); never imported
// from a client component.

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, color: "#18181b", fontFamily: "Helvetica" },
  row: { flexDirection: "row", justifyContent: "space-between" },
  logo: { width: 64, height: 64, objectFit: "contain", marginBottom: 6 },
  businessName: { fontSize: 14, fontWeight: 700 },
  muted: { color: "#71717a" },
  sectionLabel: { fontSize: 8, color: "#71717a", textTransform: "uppercase", marginBottom: 3 },
  card: { border: "1pt solid #e4e4e7", borderRadius: 4, padding: 10, width: "48%" },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 2 },
  table: { marginTop: 20, border: "1pt solid #e4e4e7", borderRadius: 4 },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#fafafa",
    borderBottom: "1pt solid #e4e4e7",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1pt solid #f4f4f5",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  th: { fontSize: 8, color: "#71717a", textTransform: "uppercase" },
  colItem: { width: "34%" },
  colQty: { width: "12%", textAlign: "right" },
  colPrice: { width: "16%", textAlign: "right" },
  colDiscount: { width: "14%", textAlign: "right" },
  colTax: { width: "10%", textAlign: "right" },
  colAmount: { width: "14%", textAlign: "right" },
  summary: { marginTop: 12, alignSelf: "flex-end", width: 220 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  summaryTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 6,
    marginTop: 3,
    borderTop: "1pt solid #e4e4e7",
    fontWeight: 700,
  },
  footer: { marginTop: 24, borderTop: "1pt solid #e4e4e7", paddingTop: 10 },
});

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

type QuotePdfItem = {
  name: string;
  description: string | null;
  unit: string;
  quantity: string;
  unitPrice: string;
  discountAmount: string;
  taxRate: string;
  lineTotal: string;
};

export type QuotePdfData = {
  quoteNumber: string;
  quoteDate: string;
  expiryDate: string | null;
  items: QuotePdfItem[];
  subtotal: string;
  discountAmount: string;
  taxAmount: string;
  totalAmount: string;
  notes: string | null;
  terms: string | null;
  business: Party & { logoUrl?: string | null };
  customer: Party;
};

function addressLines(party: Party): string[] {
  const cityLine = [party.city, party.state, party.postalCode].filter(Boolean).join(", ");
  return [party.address, cityLine, party.country].filter((line): line is string => Boolean(line));
}

function PartyBlock({ label, party }: { label: string; party: Party }) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <Text style={{ fontWeight: 700 }}>{party.name}</Text>
      {party.companyName && <Text>{party.companyName}</Text>}
      {addressLines(party).map((line, i) => (
        <Text key={i} style={styles.muted}>
          {line}
        </Text>
      ))}
      {party.email && <Text style={styles.muted}>{party.email}</Text>}
      {party.phone && <Text style={styles.muted}>{party.phone}</Text>}
      {party.taxNumber && <Text style={styles.muted}>Tax/GST: {party.taxNumber}</Text>}
    </View>
  );
}

export function QuotePdfDocument({ data }: { data: QuotePdfData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.row}>
          <View>
            {data.business.logoUrl && (
              // react-pdf's Image is a PDF primitive, not an HTML <img> — no alt prop.
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={data.business.logoUrl} style={styles.logo} />
            )}
            <Text style={styles.businessName}>{data.business.name}</Text>
            {addressLines(data.business).map((line, i) => (
              <Text key={i} style={styles.muted}>
                {line}
              </Text>
            ))}
            {data.business.phone && <Text style={styles.muted}>{data.business.phone}</Text>}
            {data.business.email && <Text style={styles.muted}>{data.business.email}</Text>}
            {data.business.taxNumber && <Text style={styles.muted}>Tax/GST: {data.business.taxNumber}</Text>}
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.title}>QUOTE</Text>
            <Text>{data.quoteNumber}</Text>
            <Text style={styles.muted}>Date: {data.quoteDate}</Text>
            {data.expiryDate && <Text style={styles.muted}>Valid Until: {data.expiryDate}</Text>}
          </View>
        </View>

        <View style={[styles.row, { marginTop: 20 }]}>
          <PartyBlock label="Billed To" party={data.customer} />
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.th, styles.colItem]}>Item</Text>
            <Text style={[styles.th, styles.colQty]}>Qty</Text>
            <Text style={[styles.th, styles.colPrice]}>Unit Price</Text>
            <Text style={[styles.th, styles.colDiscount]}>Discount</Text>
            <Text style={[styles.th, styles.colTax]}>Tax</Text>
            <Text style={[styles.th, styles.colAmount]}>Amount</Text>
          </View>
          {data.items.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <View style={styles.colItem}>
                <Text>{item.name}</Text>
                {item.description && <Text style={styles.muted}>{item.description}</Text>}
              </View>
              <Text style={styles.colQty}>
                {item.quantity} {item.unit}
              </Text>
              <Text style={styles.colPrice}>{item.unitPrice}</Text>
              <Text style={styles.colDiscount}>{item.discountAmount}</Text>
              <Text style={styles.colTax}>{item.taxRate}%</Text>
              <Text style={styles.colAmount}>{item.lineTotal}</Text>
            </View>
          ))}
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.muted}>Subtotal</Text>
            <Text>{data.subtotal}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.muted}>Discount</Text>
            <Text>{data.discountAmount}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.muted}>Tax</Text>
            <Text>{data.taxAmount}</Text>
          </View>
          <View style={styles.summaryTotalRow}>
            <Text>Total</Text>
            <Text>{data.totalAmount}</Text>
          </View>
        </View>

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
