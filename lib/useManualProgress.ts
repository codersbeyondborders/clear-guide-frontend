import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

export interface ManualProgress {
  id: string;
  status: 'pending' | 'parsing' | 'extracting' | 'completed' | 'error';
  progressPercent: number;
  message?: string;
  parsedData?: any;
}

export function useManualProgress(manualId: string | null) {
  const [progress, setProgress] = useState<ManualProgress | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!manualId) return;

    const manualRef = doc(db, 'manuals', manualId);
    const unsubscribe = onSnapshot(
      manualRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setProgress({ id: docSnap.id, ...docSnap.data() } as ManualProgress);
        } else {
          setProgress(null);
        }
      },
      (err) => {
        console.error("Firestore Error:", err);
        setError(err);
      }
    );

    return () => unsubscribe();
  }, [manualId]);

  return { progress, error };
}
