import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, doc, getDoc, setDoc } from 'firebase/firestore';

// Provide a mock Firebase config
const firebaseConfig = {
  apiKey: "demo-api-key",
  projectId: "clear-guide",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

connectAuthEmulator(auth, "http://127.0.0.1:9099");
connectFirestoreEmulator(db, "127.0.0.1", 8080);

async function runTests() {
  console.log("Starting Auth tests...");

  try {
    // 1. Test End User Signup
    console.log("Testing End User Signup...");
    const userEmail = `enduser_${Date.now()}@test.com`;
    const userCredential = await createUserWithEmailAndPassword(auth, userEmail, "password123");
    
    const userProfile = {
      uid: userCredential.user.uid,
      name: "Test User",
      email: userEmail,
      userType: 'end_user',
      fontSizePref: 'medium',
      highContrast: false,
      reducedMotion: false,
      screenReader: false,
      colorBlindMode: 'none',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await setDoc(doc(db, 'users', userCredential.user.uid), userProfile);
    
    // Verify it exists
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    if (!userDoc.exists()) throw new Error("End User profile not found in Firestore.");
    console.log("✅ End User profile created successfully.");

    // 2. Test Manufacturer Signup
    console.log("Testing Manufacturer Signup...");
    const mfgEmail = `mfg_${Date.now()}@test.com`;
    const mfgCredential = await createUserWithEmailAndPassword(auth, mfgEmail, "password123");
    
    const mfgProfile = {
      uid: mfgCredential.user.uid,
      name: "Test Mfg",
      email: mfgEmail,
      userType: 'manufacturer',
      companyId: `company_${mfgCredential.user.uid}`,
      role: 'owner',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const companyProfile = {
      id: `company_${mfgCredential.user.uid}`,
      ownerUid: mfgCredential.user.uid,
      name: "Test Company",
      industry: "Testing",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await setDoc(doc(db, 'companies', companyProfile.id), companyProfile);
    await setDoc(doc(db, 'manufacturers', mfgCredential.user.uid), mfgProfile);
    
    const mfgDoc = await getDoc(doc(db, 'manufacturers', mfgCredential.user.uid));
    const compDoc = await getDoc(doc(db, 'companies', companyProfile.id));
    
    if (!mfgDoc.exists()) throw new Error("Manufacturer profile not found in Firestore.");
    if (!compDoc.exists()) throw new Error("Company profile not found in Firestore.");
    
    console.log("✅ Manufacturer and Company profiles created successfully.");

    console.log("All auth tests passed!");
    process.exit(0);
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  }
}

runTests();
