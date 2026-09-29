import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { AuthForm } from "@/components/auth/auth-form";
import { oauthErrorKey } from "@/lib/domain/oauth";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Auth.signIn");
  return { title: t("title") };
}

export default async function SignInPage({
  searchParams,
}: PageProps<"/sign-in">) {
  const { next, error } = await searchParams;

  return (
    <AuthForm
      mode="signIn"
      next={typeof next === "string" ? next : undefined}
      oauthError={oauthErrorKey(error)}
    />
  );
}
