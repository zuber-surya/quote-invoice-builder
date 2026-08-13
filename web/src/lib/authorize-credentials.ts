import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";

// Split out of lib/auth.ts so it can be unit tested without importing the real
// NextAuth() config — that pulls in next-auth's edge runtime checks, which don't
// resolve under vitest's plain node environment.
export async function authorizeCredentials(credentials: unknown) {
  const parsed = loginSchema.safeParse(credentials);
  if (!parsed.success) return null;

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  const passwordValid = await bcrypt.compare(password, user.passwordHash);
  if (!passwordValid) return null;

  return { id: user.id, name: user.name, email: user.email };
}
