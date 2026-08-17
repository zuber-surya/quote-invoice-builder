"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type BusinessProfileStringFields = {
  businessName: string;
  logoUrl: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  taxNumber: string;
  website: string;
  currency: string;
  bankAccountName: string;
  bankName: string;
  bankAccountNumber: string;
  ifscCode: string;
  swiftBicCode: string;
  lutNumber: string;
  lutDate: string;
};

type BusinessProfilePdfColumnFields = {
  pdfShowQuantity: boolean;
  pdfShowUnitPrice: boolean;
  pdfShowDiscount: boolean;
  pdfShowTax: boolean;
  pdfShowSacCode: boolean;
};

type BusinessProfileFormValues = BusinessProfileStringFields & BusinessProfilePdfColumnFields;

const EMPTY_VALUES: BusinessProfileFormValues = {
  businessName: "",
  logoUrl: "",
  ownerName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  country: "",
  postalCode: "",
  taxNumber: "",
  website: "",
  currency: "INR",
  bankAccountName: "",
  bankName: "",
  bankAccountNumber: "",
  ifscCode: "",
  swiftBicCode: "",
  lutNumber: "",
  lutDate: "",
  pdfShowQuantity: true,
  pdfShowUnitPrice: true,
  pdfShowDiscount: true,
  pdfShowTax: true,
  pdfShowSacCode: false,
};

function Field({
  label,
  name,
  value,
  onChange,
  required,
  type = "text",
}: {
  label: string;
  name: keyof BusinessProfileStringFields;
  value: string;
  onChange: (name: keyof BusinessProfileStringFields, value: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={name}>
        {label}
        {required ? " *" : ""}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
      />
    </div>
  );
}

function CheckboxField({
  label,
  name,
  checked,
  onChange,
}: {
  label: string;
  name: keyof BusinessProfilePdfColumnFields;
  checked: boolean;
  onChange: (name: keyof BusinessProfilePdfColumnFields, checked: boolean) => void;
}) {
  return (
    <label htmlFor={name} className="flex items-center gap-2 text-sm text-foreground">
      <input
        id={name}
        name={name}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(name, e.target.checked)}
        className="h-4 w-4 rounded border-border"
      />
      {label}
    </label>
  );
}

export function BusinessProfileForm({
  initialValues,
  isFirstTimeSetup,
}: {
  initialValues: Partial<BusinessProfileFormValues>;
  isFirstTimeSetup: boolean;
}) {
  const router = useRouter();
  const [values, setValues] = useState<BusinessProfileFormValues>({
    ...EMPTY_VALUES,
    ...initialValues,
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function updateField(name: keyof BusinessProfileStringFields, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function updateCheckbox(name: keyof BusinessProfilePdfColumnFields, checked: boolean) {
    setValues((prev) => ({ ...prev, [name]: checked }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setSaving(true);

    const response = await fetch("/api/v1/business-profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const result = await response.json().catch(() => null);
    setSaving(false);

    if (!response.ok || !result?.success) {
      if (result?.error?.code === "VALIDATION_ERROR") {
        setFieldErrors(result.error.fields ?? {});
      }
      setFormError(result?.error?.message ?? "Unable to save business profile. Please try again.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Business Name" name="businessName" value={values.businessName} onChange={updateField} required />
        <Field label="Owner Name" name="ownerName" value={values.ownerName} onChange={updateField} />
        <Field label="Email" name="email" type="email" value={values.email} onChange={updateField} />
        <Field label="Phone" name="phone" value={values.phone} onChange={updateField} />
        <Field label="Address" name="address" value={values.address} onChange={updateField} />
        <Field label="City" name="city" value={values.city} onChange={updateField} />
        <Field label="State" name="state" value={values.state} onChange={updateField} />
        <Field label="Country" name="country" value={values.country} onChange={updateField} />
        <Field label="Postal Code" name="postalCode" value={values.postalCode} onChange={updateField} />
        <Field label="Tax / GST Number" name="taxNumber" value={values.taxNumber} onChange={updateField} />
        <Field label="Website" name="website" value={values.website} onChange={updateField} />
        <Field label="Logo URL" name="logoUrl" value={values.logoUrl} onChange={updateField} />
        <Field label="Currency" name="currency" value={values.currency} onChange={updateField} required />
      </div>

      <div className="flex flex-col gap-4 border-t border-border pt-6">
        <div>
          <h2 className="text-sm font-medium text-foreground">Payment Bank Details</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Optional — shown on invoice PDFs when filled in.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="A/C Name" name="bankAccountName" value={values.bankAccountName} onChange={updateField} />
          <Field label="Bank Name" name="bankName" value={values.bankName} onChange={updateField} />
          <Field label="A/C No" name="bankAccountNumber" value={values.bankAccountNumber} onChange={updateField} />
          <Field label="IFSC Code" name="ifscCode" value={values.ifscCode} onChange={updateField} />
          <Field label="SWIFT/BIC Code" name="swiftBicCode" value={values.swiftBicCode} onChange={updateField} />
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-border pt-6">
        <div>
          <h2 className="text-sm font-medium text-foreground">Export / SEZ Details</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Optional — set a LUT number to show the export/SEZ declaration on invoice PDFs.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="LUT Number" name="lutNumber" value={values.lutNumber} onChange={updateField} />
          <Field label="LUT Date" name="lutDate" type="date" value={values.lutDate} onChange={updateField} />
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-border pt-6">
        <div>
          <h2 className="text-sm font-medium text-foreground">Invoice PDF Settings</h2>
          <p className="mt-1 text-xs text-muted-foreground">Choose which item columns appear on invoice PDFs.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <CheckboxField label="Quantity" name="pdfShowQuantity" checked={values.pdfShowQuantity} onChange={updateCheckbox} />
          <CheckboxField label="Unit Price" name="pdfShowUnitPrice" checked={values.pdfShowUnitPrice} onChange={updateCheckbox} />
          <CheckboxField label="Discount" name="pdfShowDiscount" checked={values.pdfShowDiscount} onChange={updateCheckbox} />
          <CheckboxField label="Tax" name="pdfShowTax" checked={values.pdfShowTax} onChange={updateCheckbox} />
          <CheckboxField label="SAC Code" name="pdfShowSacCode" checked={values.pdfShowSacCode} onChange={updateCheckbox} />
        </div>
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

      <Button type="submit" disabled={saving} className="w-fit">
        {saving ? "Saving…" : isFirstTimeSetup ? "Save & Continue" : "Save Changes"}
      </Button>
    </form>
  );
}
