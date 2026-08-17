"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ProductFormValues = {
  name: string;
  description: string;
  unit: string;
  price: string;
  taxRate: string;
  sacCode: string;
};

const EMPTY_VALUES: ProductFormValues = {
  name: "",
  description: "",
  unit: "",
  price: "",
  taxRate: "",
  sacCode: "",
};

function Field({
  label,
  name,
  value,
  onChange,
  required,
  placeholder,
  textarea,
  type = "text",
}: {
  label: string;
  name: keyof ProductFormValues;
  value: string;
  onChange: (name: keyof ProductFormValues, value: string) => void;
  required?: boolean;
  placeholder?: string;
  textarea?: boolean;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={name}>
        {label}
        {required ? " *" : ""}
      </Label>
      {textarea ? (
        <Textarea
          id={name}
          name={name}
          required={required}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          rows={3}
        />
      ) : (
        <Input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
        />
      )}
    </div>
  );
}

export function ProductForm({
  mode,
  productId,
  initialValues,
}: {
  mode: "create" | "edit";
  productId?: string;
  initialValues?: Partial<ProductFormValues>;
}) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>({
    ...EMPTY_VALUES,
    ...initialValues,
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function updateField(name: keyof ProductFormValues, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setSaving(true);

    try {
      const url = mode === "create" ? "/api/v1/products" : `/api/v1/products/${productId}`;
      const response = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const result = await response.json().catch(() => null);
      setSaving(false);

      if (!response.ok || !result?.success) {
        if (result?.error?.code === "VALIDATION_ERROR") {
          setFieldErrors(result.error.fields ?? {});
        }
        setFormError(result?.error?.message ?? "Unable to save product. Please try again.");
        return;
      }

      router.push(`/products/${result.data.id}`);
      router.refresh();
    } catch (error) {
      setSaving(false);
      setFormError("Network error. Please check your connection and try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Product / Service Name" name="name" value={values.name} onChange={updateField} required />
        <Field label="Unit" name="unit" value={values.unit} onChange={updateField} required placeholder="Project, Hour, Kg…" />
        <Field label="Price" name="price" value={values.price} onChange={updateField} required type="number" placeholder="25000.00" />
        <Field label="Tax %" name="taxRate" value={values.taxRate} onChange={updateField} type="number" placeholder="18.00" />
        <Field label="SAC Code" name="sacCode" value={values.sacCode} onChange={updateField} placeholder="998314" />
      </div>
      <Field label="Description" name="description" value={values.description} onChange={updateField} textarea />

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

      <Button type="submit" disabled={saving} className="w-fit">
        {saving ? "Saving…" : mode === "create" ? "Create Product" : "Save Changes"}
      </Button>
    </form>
  );
}