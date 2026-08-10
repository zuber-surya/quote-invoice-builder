"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type CustomerFormValues = {
  name: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  taxNumber: string;
  notes: string;
};

const EMPTY_VALUES: CustomerFormValues = {
  name: "",
  companyName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  country: "",
  postalCode: "",
  taxNumber: "",
  notes: "",
};

function Field({
  label,
  name,
  value,
  onChange,
  required,
  type = "text",
  textarea,
}: {
  label: string;
  name: keyof CustomerFormValues;
  value: string;
  onChange: (name: keyof CustomerFormValues, value: string) => void;
  required?: boolean;
  type?: string;
  textarea?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-zinc-700">
        {label}
        {required ? " *" : ""}
      </label>
      {textarea ? (
        <textarea
          id={name}
          name={name}
          required={required}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          rows={3}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          required={required}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
        />
      )}
    </div>
  );
}

export function CustomerForm({
  mode,
  customerId,
  initialValues,
}: {
  mode: "create" | "edit";
  customerId?: string;
  initialValues?: Partial<CustomerFormValues>;
}) {
  const router = useRouter();
  const [values, setValues] = useState<CustomerFormValues>({
    ...EMPTY_VALUES,
    ...initialValues,
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function updateField(name: keyof CustomerFormValues, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setSaving(true);

    const url = mode === "create" ? "/api/v1/customers" : `/api/v1/customers/${customerId}`;
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
      setFormError(result?.error?.message ?? "Unable to save customer. Please try again.");
      return;
    }

    router.push(`/customers/${result.data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Customer Name" name="name" value={values.name} onChange={updateField} required />
        <Field label="Company Name" name="companyName" value={values.companyName} onChange={updateField} />
        <Field label="Email" name="email" type="email" value={values.email} onChange={updateField} />
        <Field label="Phone" name="phone" value={values.phone} onChange={updateField} />
        <Field label="Address" name="address" value={values.address} onChange={updateField} />
        <Field label="City" name="city" value={values.city} onChange={updateField} />
        <Field label="State" name="state" value={values.state} onChange={updateField} />
        <Field label="Country" name="country" value={values.country} onChange={updateField} />
        <Field label="Postal Code" name="postalCode" value={values.postalCode} onChange={updateField} />
        <Field label="Tax / GST Number" name="taxNumber" value={values.taxNumber} onChange={updateField} />
      </div>
      <Field label="Notes" name="notes" value={values.notes} onChange={updateField} textarea />

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

      <button
        type="submit"
        disabled={saving}
        className="w-fit rounded-md bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
      >
        {saving ? "Saving…" : mode === "create" ? "Create Customer" : "Save Changes"}
      </button>
    </form>
  );
}
