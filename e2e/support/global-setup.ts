import { deleteTestUsers } from "./supabase-admin";

const ONE_HOUR_MS = 60 * 60 * 1000;

export default async function globalSetup() {
  // Workers inherit this variable, so every test tags its users with the run.
  process.env.E2E_RUN_ID = Date.now().toString(36);

  // Removes users left behind by runs that crashed before their teardown.
  // Recent users are kept, since a parallel run (local or CI) may own them.
  const cutoff = Date.now() - ONE_HOUR_MS;
  await deleteTestUsers(({ createdAt }) => Date.parse(createdAt) < cutoff);
}
