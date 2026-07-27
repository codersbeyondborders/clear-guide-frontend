import { redirect } from 'next/navigation'

// /sign-in is now /manufacturer/sign-in
export default function LegacySignInPage({
  searchParams,
}: {
  searchParams: { redirectTo?: string }
}) {
  const qs = searchParams.redirectTo ? `?redirectTo=${searchParams.redirectTo}` : ''
  redirect(`/manufacturer/sign-in${qs}`)
}
