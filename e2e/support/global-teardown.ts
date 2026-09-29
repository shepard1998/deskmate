import { currentRunPrefix, deleteTestUsers } from "./supabase-admin";

export default async function globalTeardown() {
  const prefix = currentRunPrefix();
  await deleteTestUsers(({ email }) => email.startsWith(prefix));
}
