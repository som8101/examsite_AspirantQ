import { AuthClient } from '@/components/auth/AuthClient';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string, message?: string }>
}) {
  const resolvedParams = await searchParams;
  return <AuthClient error={resolvedParams?.error} message={resolvedParams?.message} />;
}
