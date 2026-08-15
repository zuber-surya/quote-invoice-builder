"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type CustomerOption = { id: string; name: string };
type ProductOption = { id: string; name: string; unit: string; price: string; taxRate: string; description: string | null };

type InvoiceItemFormValues = {
  productId: string;
  name: string;
  description: string;
  unit: string;
  quantity: string;
  unitPrice: string;
  discountAmount: string;
  taxRate: string;
};

const EMPTY_ITEM: InvoiceItemFormValues = {
  productId: "",
  name: "",
  description: "",
  unit: "",
  quantity: "1",
  unitPrice: "0.00",
  discountAmount: "0.00",
  taxRate: "0.00",
};

type InvoiceFormValues = {
  customerId: string;
  invoiceDate: string;
  dueDate: string;
  items: InvoiceItemFormValues[];
  notes: string;
  terms: string;
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

// Mirrors quotes/quote-form.tsx's preview totals — UX convenience only, never
// authoritative (CLAUDE.md rule 10 — the server always recalculates).
function previewTotals(items: InvoiceItemFormValues[]) {
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

// Mirrors quotes/quote-form.tsx. Unlike quotes, a created invoice is issued
// immediately as UNPAID (lib/serialize-invoice.ts / API Spec 46-47) rather than
// starting as a DRAFT — so this form has no "save as draft" framing.
export function InvoiceForm({
  mode,
  invoiceId,
  initialValues,
}: {
  mode: "create" | "edit";
  invoiceId?: string;
  initialValues?: Partial<InvoiceFormValues>;
}) {
  const router = useRouter();
  const [values, setValues] = useState<InvoiceFormValues>({
    customerId: "",
    invoiceDate: todayIso(),
    dueDate: "",
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

  function updateField<K extends keyof InvoiceFormValues>(name: K, value: InvoiceFormValues[K]) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function updateItem(index: number, patch: Partial<InvoiceItemFormValues>) {
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

    const url = mode === "create" ? "/api/v1/invoices" : `/api/v1/invoices/${invoiceId}`;
    const payload = {
      customerId: values.customerId,
      invoiceDate: values.invoiceDate,
      dueDate: values.dueDate,
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

    try {
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
        setFormError(result?.error?.message ?? "Unable to save invoice. Please try again.");
        return;
      }

      router.push(`/invoices/${result.data.id}`);
      router.refresh();
    } catch (error) {
      setSaving(false);
      setFormError("Network error. Please check your connection and try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1 sm:col-span-1">
            <Label htmlFor="customerId">
              Customer *
            </Label>
            <Select
              required
              value={values.customerId}
              onValueChange={(value) => updateField("customerId", value ?? "")}
            >
              <SelectTrigger id="customerId" className="w-full">
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="invoiceDate">
              Invoice Date *
            </Label>
            <Input
              id="invoiceDate"
              type="date"
              required
              value={values.invoiceDate}
              onChange={(e) => updateField("invoiceDate", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="dueDate">
              Due Date
            </Label>
            <Input
              id="dueDate"
              type="date"
              value={values.dueDate}
              onChange={(e) => updateField("dueDate", e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-foreground">Items</h2>
            <Button
              type="button"
              onClick={addItem}
              variant="outline"
              size="sm"
            >
              + Add Item
            </Button>
          </div>

          <div className="flex flex-col gap-3">
            {values.items.map((item, index) => (
              <div key={index} className="rounded-lg border border-border p-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-6">
                  <div className="flex flex-col gap-1 sm:col-span-2">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Product / Service
                    </Label>
                    <Select
                      value={item.productId}
                      onValueChange={(value) => selectProduct(index, value ?? "")}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Custom Item" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1 sm:col-span-2">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Name *
                    </Label>
                    <Input
                      required
                      value={item.name}
                      onChange={(e) => updateItem(index, { name: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Unit *
                    </Label>
                    <Input
                      required
                      value={item.unit}
                      onChange={(e) => updateItem(index, { unit: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Qty *
                    </Label>
                    <Input
                      required
                      inputMode="decimal"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, { quantity: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Unit Price *
                    </Label>
                    <Input
                      required
                      inputMode="decimal"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, { unitPrice: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Discount
                    </Label>
                    <Input
                      inputMode="decimal"
                      value={item.discountAmount}
                      onChange={(e) => updateItem(index, { discountAmount: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Tax %
                    </Label>
                    <Input
                      inputMode="decimal"
                      value={item.taxRate}
                      onChange={(e) => updateItem(index, { taxRate: e.target.value })}
                    />
                  </div>
                </div>
                {values.items.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeItem(index)}
                    variant="outline"
                    size="xs"
                    className="mt-2"
                  >
                    Remove item
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="notes">
            Notes
          </Label>
          <Textarea
            id="notes"
            rows={2}
            value={values.notes}
            onChange={(e) => updateField("notes", e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="terms">
            Terms
          </Label>
          <Textarea
            id="terms"
            rows={2}
            value={values.terms}
            onChange={(e) => updateField("terms", e.target.value)}
          />
        </div>

        {Object.keys(fieldErrors).length > 0 && (
          <ul className="text-sm text-destructive">
            {Object.entries(fieldErrors).map(([field, message]) => (
              <li key={field}>{message}</li>
            ))}
          </ul>
        )}
        {formError && (
          <p role="alert" className="text-sm text-destructive">
            {formError}
          </p>
        )}
      </div>

      <div className="h-fit rounded-lg border border-border bg-muted p-5">
        <h2 className="text-sm font-medium text-foreground">Summary</h2>
        <p className="mt-1 text-xs text-muted-foreground">Preview only — final totals are calculated on save.</p>
        <dl className="mt-4 flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="font-mono text-foreground">{money(totals.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Discount</dt>
            <dd className="font-mono text-foreground">{money(totals.discountAmount)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Tax</dt>
            <dd className="font-mono text-foreground">{money(totals.taxAmount)}</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-2 font-semibold">
            <dt className="text-foreground">Total</dt>
            <dd className="font-mono text-foreground">{money(totals.totalAmount)}</dd>
          </div>
        </dl>

        <Button
          type="submit"
          disabled={saving}
          className="mt-5 w-full"
        >
          {saving ? "Saving…" : mode === "create" ? "Create Invoice" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}