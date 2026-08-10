import { auth } from "@/lib/auth";

// Single abstraction for "who is making this request" — docs/API Specification.md
// section 5. Every protected route/server-component should go through this rather
// than reading the session directly, and must NEVER accept a user id from the client.
export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return { id: session.user.id, name: session.user.name ?? null, email: session.user.email ?? null };
}
