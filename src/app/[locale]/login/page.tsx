import { Suspense } from "react";

import { LoginScreen } from "@/features/auth/login-screen";
import { Locale } from "@/i18n";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return (
    <Suspense fallback={null}>
      <LoginScreen locale={locale} />
    </Suspense>
  );
}
