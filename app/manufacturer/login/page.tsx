import { redirect } from 'next/navigation'

// /manufacturer/login is now /manufacturer/sign-in
export default function LegacyManufacturerLoginPage() {
  redirect('/manufacturer/sign-in')
}
