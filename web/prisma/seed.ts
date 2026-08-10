import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Development seed data only — never contains real customer information.
// See docs/Database Design Document.md section 50.
const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@example.com",
      passwordHash,
      businessProfile: {
        create: {
          businessName: "Demo Business",
          ownerName: "Demo User",
          email: "demo@example.com",
          currency: "INR",
        },
      },
    },
  });

  const customer = await prisma.customer.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      userId: user.id,
      name: "Demo Customer",
      companyName: "ABC Ltd (Demo)",
      email: "customer@example.com",
    },
  });

  const websiteDev = await prisma.product.upsert({
    where: { id: "00000000-0000-0000-0000-000000000002" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000002",
      userId: user.id,
      name: "Website Development",
      description: "Business website development",
      unit: "Project",
      price: 25000,
      taxRate: 18,
    },
  });

  await prisma.product.upsert({
    where: { id: "00000000-0000-0000-0000-000000000003" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000003",
      userId: user.id,
      name: "Consulting Service",
      description: "Hourly consulting",
      unit: "Hour",
      price: 1500,
      taxRate: 18,
    },
  });

  const existingQuote = await prisma.quote.findFirst({
    where: { userId: user.id, quoteNumber: "Q-00001" },
  });

  if (!existingQuote) {
    const subtotal = 25000;
    const taxAmount = 4500;
    const totalAmount = subtotal + taxAmount;

    await prisma.quote.create({
      data: {
        userId: user.id,
        customerId: customer.id,
        quoteNumber: "Q-00001",
        quoteDate: new Date(),
        status: "DRAFT",
        subtotal,
        discountAmount: 0,
        taxAmount,
        totalAmount,
        items: {
          create: [
            {
              productId: websiteDev.id,
              name: websiteDev.name,
              description: websiteDev.description,
              unit: websiteDev.unit,
              quantity: 1,
              unitPrice: websiteDev.price,
              discountAmount: 0,
              taxRate: websiteDev.taxRate,
              taxAmount,
              lineTotal: totalAmount,
              sortOrder: 0,
            },
          ],
        },
      },
    });
  }

  console.log("Seed complete:", { user: user.email });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
