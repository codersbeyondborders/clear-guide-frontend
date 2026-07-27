import { redirect } from 'next/navigation'

// /sign-up is now /manufacturer/sign-up
export default function LegacySignUpPage() {
  redirect('/manufacturer/sign-up')
}
