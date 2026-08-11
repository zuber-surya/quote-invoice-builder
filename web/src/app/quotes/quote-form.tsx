"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type CustomerOption = { id: string; name: string };
type ProductOption = { id: string; name: string; unit: string; price: string; taxRate: string; description: string | null };

type QuoteItemFormValues = {
  productId: string;
  name: string;
  description: string;
  unit: string;
  quantity: string;
  unitPrice: string;
  discountAmount: string;
  taxRate: string;
};

const EMPTY_ITEM: QuoteItemFormValues = {
  productId: "",
  name: "",
  description: "",
  unit: "",
  quantity: "1",
  unitPrice: "0.00",
  discountAmount: "0.00",
  taxRate: "0.00",
};

type QuoteFormValues = {
  customerId: string;
  quoteDate: string;
  expiryDate: string;
  items: QuoteItemFormValues[];
  notes: string;
  terms: string;
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

// docs/UI-UX Specification.md section 31 — preview updates immediately as the
// user edits quantity/price/discount/tax. This mirrors lib/document-calculation.ts
// but uses plain numbers: it's a UX convenience only, never authoritative
// (CLAUDE.md rule 10 — the server always recalculates).
function previewTotals(items: QuoteItemFormValues[]) {
  let subtotal = 0;
  let discountAmount = 0;
  let taxAmount = 0;

  for (const item of items) {
    const quantity = parseFloat(item.quantity) || 0;
    const unitPrice = parseFloat(item.unitPrice) || 0;
    const discount = parseFloat(item.discountAmount) || 0;
    const taxRate = parseFloat(item.taxRate) || 0;

    const gross = quantity * unitPrice;
    const discounted = gross - discount;
    const tax = discounted * (taxRate / 100);

    subtotal += gross;
    discountAmount += discount;
    taxAmount += tax;
  }

  const totalAmount = subtotal - discountAmount + taxAmount;
  return { subtotal, discountAmount, taxAmount, totalAmount };
}

const money = (value: number) => value.toFixed(2);

export function QuoteForm({
  mode,
  quoteId,
  initialValues,
}: {
  mode: "create" | "edit";
  quoteId?: string;
  initialValues?: Partial<QuoteFormValues>;
}) {
  const router = useRouter();
  const [values, setValues] = useState<QuoteFormValues>({
    customerId: "",
    quoteDate: todayIso(),
    expiryDate: "",
    items: [{ ...EMPTY_ITEM }],
    notes: "",
    terms: "",
    ...initialValues,
  });
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/v1/customers?pageSize=100")
      .then((res) => res.json())
      .then((result) => {
        if (result.success) setCustomers(result.data);
      })
      .catch(() => {});
    fetch("/api/v1/products?pageSize=100")
      .then((res) => res.json())
      .then((result) => {
        if (result.success) setProducts(result.data);
      })
      .catch(() => {});
  }, []);

  const totals = useMemo(() => previewTotals(values.items), [values.items]);

  function updateField<K extends keyof QuoteFormValues>(name: K, value: QuoteFormValues[K]) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function updateItem(index: number, patch: Partial<QuoteItemFormValues>) {
    setValues((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  }

  function selectProduct(index: number, productId: string) {
    if (!productId) {
      updateItem(index, { productId: "" });
      return;
    }
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    updateItem(index, {
      productId,
      name: product.name,
      description: product.description ?? "",
      unit: product.unit,
      unitPrice: product.price,
      taxRate: product.taxRate,
    });
  }

  function addItem() {
    setValues((prev) => ({ ...prev, items: [...prev.items, { ...EMPTY_ITEM }] }));
  }

  function removeItem(index: number) {
    setValues((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setSaving(true);

    const url = mode === "create" ? "/api/v1/quotes" : `/api/v1/quotes/${quoteId}`;
    const payload = {
      customerId: values.customerId,
      quoteDate: values.quoteDate,
      expiryDate: values.expiryDate,
      notes: values.notes,
      terms: values.terms,
      items: values.items.map((item) => ({
        productId: item.productId || undefined,
        name: item.name,
        description: item.description,
        unit: item.unit,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountAmount: item.discountAmount,
        taxRate: item.taxRate,
      })),
    };

    const response = await fetch(url, {
      method: mode === "create" ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => null);
    setSaving(false);

    if (!response.ok || !result?.success) {
      if (result?.error?.code === "VALIDATION_ERROR") {
        setFieldErrors(result.error.fields ?? {});
      }
      setFormError(result?.error?.message ?? "Unable to save quote. Please try again.");
      return;
    }

    router.push(`/quotes/${result.data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1 sm:col-span-1">
            <label htmlFor="customerId" className="text-sm font-medium text-zinc-700">
              Customer *
            </label>
            <select
              id="customerId"
              required
              value={values.customerId}
              onChange={(e) => updateField("customerId", e.target.value)}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
            >
              <option value="">Select customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="quoteDate" className="text-sm font-medium text-zinc-700">
              Quote Date *
            </label>
            <input
              id="quoteDate"
              type="date"
              required
              value={values.quoteDate}
              onChange={(e) => updateField("quoteDate", e.target.value)}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="expiryDate" className="text-sm font-medium text-zinc-700">
              Expiry Date
            </label>
            <input
              id="expiryDate"
              type="date"
              value={values.expiryDate}
              onChange={(e) => updateField("expiryDate", e.target.value)}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-zinc-700">Items</h2>
            <button
              type="button"
              onClick={addItem}
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              + Add Item
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {values.items.map((item, index) => (
              <div key={index} className="rounded-lg border border-zinc-200 p-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-6">
                  <div className="flex flex-col gap-1 sm:col-span-2">
                    <label className="text-xs font-medium text-zinc-500">Product / Service</label>
                    <select
                      value={item.productId}
                      onChange={(e) => selectProduct(index, e.target.value)}
                      className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                    >
                      <option value="">Custom Item</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1 sm:col-span-2">
                    <label className="text-xs font-medium text-zinc-500">Name *</label>
                    <input
                      required
                      value={item.name}
                      onChange={(e) => updateItem(index, { name: e.target.value })}
                      className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-zinc-500">Unit *</label>
                    <input
                      required
                      value={item.unit}
                      onChange={(e) => updateItem(index, { unit: e.target.value })}
                      className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-zinc-500">Qty *</label>
                    <input
                      required
                      inputMode="decimal"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, { quantity: e.target.value })}
                      className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-zinc-500">Unit Price *</label>
                    <input
                      required
                      inputMode="decimal"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, { unitPrice: e.target.value })}
                      className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-zinc-500">Discount</label>
                    <input
                      inputMode="decimal"
                      value={item.discountAmount}
                      onChange={(e) => updateItem(index, { discountAmount: e.target.value })}
                      className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-zinc-500">Tax %</label>
                    <input
                      inputMode="decimal"
                      value={item.taxRate}
                      onChange={(e) => updateItem(index, { taxRate: e.target.value })}
                      className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                    />
                  </div>
                </div>
                {values.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="mt-2 text-xs font-medium text-red-600 hover:underline"
                  >
                    Remove item
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="notes" className="text-sm font-medium text-zinc-700">
            Notes
          </label>
          <textarea
            id="notes"
            rows={2}
            value={values.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="terms" className="text-sm font-medium text-zinc-700">
            Terms
          </label>
          <textarea
            id="terms"
            rows={2}
            value={values.terms}
            onChange={(e) => updateField("terms", e.target.value)}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
          />
        </div>

        {Object.keys(fieldErrors).length > 0 && (
          <ul className="text-sm text-red-600">
            {Object.entries(fieldErrors).map(([field, message]) => (
              <li key={field}>{message}</li>
            ))}
          </ul>
        )}
        {formError && (
          <p role="alert" className="text-sm text-red-600">
            {formError}
          </p>
        )}
      </div>

      <div className="h-fit rounded-lg border border-zinc-200 bg-zinc-50 p-5">
        <h2 className="text-sm font-medium text-zinc-700">Summary</h2>
        <p className="mt-1 text-xs text-zinc-500">Preview only — final totals are calculated on save.</p>
        <dl className="mt-4 flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-zinc-500">Subtotal</dt>
            <dd className="text-zinc-900">{money(totals.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-zinc-500">Discount</dt>
            <dd className="text-zinc-900">{money(totals.discountAmount)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-zinc-500">Tax</dt>
            <dd className="text-zinc-900">{money(totals.taxAmount)}</dd>
          </div>
          <div className="flex justify-between border-t border-zinc-200 pt-2 font-semibold">
            <dt className="text-zinc-900">Total</dt>
            <dd className="text-zinc-900">{money(totals.totalAmount)}</dd>
          </div>
        </dl>

        <button
          type="submit"
          disabled={saving}
          className="mt-5 w-full rounded-md bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
        >
          {saving ? "Saving…" : mode === "create" ? "Save Draft" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
