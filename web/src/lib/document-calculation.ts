import { Prisma } from "@prisma/client";

// docs/Database Design Document.md section 40 — per-item calculation model
// (matches the QuoteItem/InvoiceItem schema, where discountAmount and taxRate
// live on each item, not just the header). Verified against
// docs/API Specification.md section 76 Test 2: qty=2, price=10000, discount=1000,
// tax=18% -> subtotal 20000, taxAmount 3420, total 22420.
//
// gross            = quantity * unitPrice
// discountedAmount = gross - discountAmount
// taxAmount        = discountedAmount * taxRate / 100
// lineTotal        = discountedAmount + taxAmount
//
// All monetary intermediate values round to 2 decimal places (NUMERIC(15,2)) at
// the point they're produced, using Prisma's Decimal (decimal.js) — never
// floating point (CLAUDE.md "Financial Rules").
//
// Shared by Quotes and Invoices — docs/Web Development Standards.md section 19
// names this exact shape (`calculateDocumentTotals()`), since both documents use
// the identical calculation model. Do not duplicate this per document type.

const MONEY_DP = 2;
const roundMoney = (value: Prisma.Decimal) => value.toDecimalPlaces(MONEY_DP, Prisma.Decimal.ROUND_HALF_UP);

export type DocumentItemCalcInput = {
  quantity: string;
  unitPrice: string;
  discountAmount: string;
  taxRate: string;
};

export type DocumentItemCalculated = DocumentItemCalcInput & {
  taxAmount: string;
  lineTotal: string;
};

export type DocumentTotals = {
  subtotal: string;
  discountAmount: string;
  taxAmount: string;
  totalAmount: string;
};

export function calculateDocumentItem(item: DocumentItemCalcInput): DocumentItemCalculated {
  const quantity = new Prisma.Decimal(item.quantity);
  const unitPrice = new Prisma.Decimal(item.unitPrice);
  const discountAmount = new Prisma.Decimal(item.discountAmount);
  const taxRate = new Prisma.Decimal(item.taxRate);

  const gross = roundMoney(quantity.times(unitPrice));
  const discounted = roundMoney(gross.minus(discountAmount));
  const taxAmount = roundMoney(discounted.times(taxRate).dividedBy(100));
  const lineTotal = roundMoney(discounted.plus(taxAmount));

  return {
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    discountAmount: discountAmount.toFixed(MONEY_DP),
    taxRate: taxRate.toFixed(MONEY_DP),
    taxAmount: taxAmount.toFixed(MONEY_DP),
    lineTotal: lineTotal.toFixed(MONEY_DP),
  };
}

export function calculateDocumentTotals(items: DocumentItemCalcInput[]): {
  items: DocumentItemCalculated[];
  totals: DocumentTotals;
} {
  const calculatedItems = items.map(calculateDocumentItem);

  const gross = (item: DocumentItemCalculated) => new Prisma.Decimal(item.quantity).times(item.unitPrice);

  const subtotal = calculatedItems.reduce(
    (sum, item) => sum.plus(roundMoney(gross(item))),
    new Prisma.Decimal(0)
  );
  const discountAmount = calculatedItems.reduce(
    (sum, item) => sum.plus(item.discountAmount),
    new Prisma.Decimal(0)
  );
  const taxAmount = calculatedItems.reduce((sum, item) => sum.plus(item.taxAmount), new Prisma.Decimal(0));
  const totalAmount = subtotal.minus(discountAmount).plus(taxAmount);

  return {
    items: calculatedItems,
    totals: {
      subtotal: subtotal.toFixed(MONEY_DP),
      discountAmount: discountAmount.toFixed(MONEY_DP),
      taxAmount: taxAmount.toFixed(MONEY_DP),
      totalAmount: totalAmount.toFixed(MONEY_DP),
    },
  };
}
