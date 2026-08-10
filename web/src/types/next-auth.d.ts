import { DefaultSession } from "next-auth";

// Augment the Auth.js session/user types with our internal user id, so
// `session.user.id` is typed throughout the app instead of requiring `any`.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
  }
}
