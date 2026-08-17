-- AlterTable
ALTER TABLE "business_profiles" ADD COLUMN     "bankAccountName" TEXT,
ADD COLUMN     "bankAccountNumber" TEXT,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "ifscCode" TEXT,
ADD COLUMN     "lutDate" DATE,
ADD COLUMN     "lutNumber" TEXT,
ADD COLUMN     "pdfShowDiscount" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "pdfShowQuantity" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "pdfShowSacCode" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pdfShowTax" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "pdfShowUnitPrice" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "swiftBicCode" TEXT;

-- AlterTable
ALTER TABLE "invoice_items" ADD COLUMN     "sacCode" TEXT;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "sacCode" TEXT;
