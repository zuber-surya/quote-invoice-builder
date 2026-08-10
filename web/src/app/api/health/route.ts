import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Phase 1 foundation requirement — docs/Code & Development Workflow.md section 29.
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", database: "connected" });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      { status: "error", database: "unreachable" },
      { status: 503 }
    );
  }
}
