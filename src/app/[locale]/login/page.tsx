import { Locale } from "@/lib/i18n";
import { LoginScreen } from "@/features/auth/login-screen";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return <LoginScreen locale={locale} />;
}
