/**
 * auth-helpers.ts
 *
 * Utility functions for creating and fetching Firestore profile documents
 * after Firebase Auth sign-up, and for Google OAuth sign-in.
 *
 * Firestore structure:
 *   users/{uid}           ← EndUserProfile
 *   manufacturers/{uid}   ← ManufacturerProfile
 *   companies/{companyId} ← CompanyDoc
 */

import {
  signInWithPopup,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from 'firebase/auth'
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { auth, db, googleProvider } from './firebase'
import type {
  EndUserProfile,
  ManufacturerProfile,
  CompanyDoc,
  AgeGroup,
  FontSizePref,
  ColorBlindMode,
} from './types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function nowISO(): string {
  return new Date().toISOString()
}

// ---------------------------------------------------------------------------
// End User Profile
// ---------------------------------------------------------------------------

interface CreateEndUserProfileParams {
  uid: string
  name: string
  email: string
  avatarUrl?: string | null
  ageGroup?: AgeGroup | null
  fontSizePref?: FontSizePref
  highContrast?: boolean
  reducedMotion?: boolean
  screenReader?: boolean
  colorBlindMode?: ColorBlindMode
}

export async function createEndUserProfile(
  params: CreateEndUserProfileParams
): Promise<EndUserProfile> {
  const now = nowISO()
  const profile: EndUserProfile = {
    uid: params.uid,
    name: params.name,
    email: params.email,
    userType: 'end_user',
    avatarUrl: params.avatarUrl ?? null,
    ageGroup: params.ageGroup ?? null,
    fontSizePref: params.fontSizePref ?? 'medium',
    highContrast: params.highContrast ?? false,
    reducedMotion: params.reducedMotion ?? false,
    screenReader: params.screenReader ?? false,
    colorBlindMode: params.colorBlindMode ?? 'none',
    createdAt: now,
    updatedAt: now,
  }

  await setDoc(doc(db, 'users', params.uid), profile)
  return profile
}

export async function getEndUserProfile(uid: string): Promise<EndUserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? (snap.data() as EndUserProfile) : null
}

// ---------------------------------------------------------------------------
// Manufacturer + Company Profile
// ---------------------------------------------------------------------------

interface CreateManufacturerProfileParams {
  uid: string
  name: string
  email: string
  companyName: string
  industry?: string | null
  website?: string | null
  description?: string | null
  logoUrl?: string | null
}

export async function createManufacturerProfile(
  params: CreateManufacturerProfileParams
): Promise<{ profile: ManufacturerProfile; company: CompanyDoc }> {
  const now = nowISO()

  // Use uid as companyId for the owner (one company per owner registration)
  const companyId = `company_${params.uid}`

  const company: CompanyDoc = {
    id: companyId,
    ownerUid: params.uid,
    name: params.companyName,
    industry: params.industry ?? null,
    website: params.website ?? null,
    description: params.description ?? null,
    logoUrl: params.logoUrl ?? null,
    createdAt: now,
    updatedAt: now,
  }

  const profile: ManufacturerProfile = {
    uid: params.uid,
    name: params.name,
    email: params.email,
    userType: 'manufacturer',
    companyId,
    role: 'owner',
    createdAt: now,
    updatedAt: now,
  }

  // Write company doc first, then manufacturer profile
  await setDoc(doc(db, 'companies', companyId), company)
  await setDoc(doc(db, 'manufacturers', params.uid), profile)

  return { profile, company }
}

export async function getManufacturerProfile(uid: string): Promise<ManufacturerProfile | null> {
  const snap = await getDoc(doc(db, 'manufacturers', uid))
  return snap.exists() ? (snap.data() as ManufacturerProfile) : null
}

// ---------------------------------------------------------------------------
// Detect user type (for AuthContext)
// ---------------------------------------------------------------------------

export type UserType = 'end_user' | 'manufacturer' | null

export async function getAuthUserType(uid: string): Promise<UserType> {
  const [userSnap, mfgSnap] = await Promise.all([
    getDoc(doc(db, 'users', uid)),
    getDoc(doc(db, 'manufacturers', uid)),
  ])
  if (userSnap.exists()) return 'end_user'
  if (mfgSnap.exists()) return 'manufacturer'
  return null
}

// ---------------------------------------------------------------------------
// Google Sign-In (End Users only)
// ---------------------------------------------------------------------------

/**
 * Initiates Google OAuth popup.
 * If the user has no Firestore profile yet (first sign-in), creates one with defaults.
 * Returns the EndUserProfile.
 */
export async function signInWithGoogle(): Promise<EndUserProfile> {
  const result = await signInWithPopup(auth, googleProvider)
  const fbUser: FirebaseUser = result.user

  // Check if profile already exists
  const existing = await getEndUserProfile(fbUser.uid)
  if (existing) return existing

  // First Google sign-in — create profile with defaults
  return createEndUserProfile({
    uid: fbUser.uid,
    name: fbUser.displayName ?? 'User',
    email: fbUser.email ?? '',
    avatarUrl: fbUser.photoURL ?? null,
  })
}

// ---------------------------------------------------------------------------
// Sign Out
// ---------------------------------------------------------------------------

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth)
}
