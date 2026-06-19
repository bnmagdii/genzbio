import React, { createContext, useContext, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firebase';

interface WidgetsContextType {
  showStatsBar: boolean;
  showGuestbook: boolean;
  setShowStatsBar: (val: boolean) => void;
  setShowGuestbook: (val: boolean) => void;
  toggleStatsBar: (bioId: string, currentVal: boolean) => Promise<void>;
  toggleGuestbook: (bioId: string, currentVal: boolean) => Promise<void>;
  subscribeBioWidgets: (bioId: string) => () => void;
}

const WidgetsContext = createContext<WidgetsContextType | null>(null);

export function WidgetsProvider({ children }: { children: React.ReactNode }) {
  const [showStatsBar, setShowStatsBar] = useState(true);
  const [showGuestbook, setShowGuestbook] = useState(true);

  const subscribeBioWidgets = (bioId: string) => {
    if (!bioId) return () => {};
    const unsub = onSnapshot(doc(db, 'bios', bioId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setShowStatsBar(data.showStatsBar !== false);
        setShowGuestbook(data.showGuestbook !== false);
      }
    }, (err) => {
      console.warn("Widgets subscription notification error: ", err);
    });
    return unsub;
  };

  const toggleStatsBar = async (bioId: string, currentVal: boolean) => {
    const newVal = !currentVal;
    setShowStatsBar(newVal);
    await setDoc(doc(db, 'bios', bioId), { 
      showStatsBar: newVal, 
      updatedAt: new Date().toISOString() 
    }, { merge: true }).catch((err) =>
      handleFirestoreError(err, OperationType.WRITE, `bios/${bioId}`)
    );
  };

  const toggleGuestbook = async (bioId: string, currentVal: boolean) => {
    const newVal = !currentVal;
    setShowGuestbook(newVal);
    await setDoc(doc(db, 'bios', bioId), { 
      showGuestbook: newVal, 
      updatedAt: new Date().toISOString() 
    }, { merge: true }).catch((err) =>
      handleFirestoreError(err, OperationType.WRITE, `bios/${bioId}`)
    );
  };

  return (
    <WidgetsContext.Provider value={{ 
      showStatsBar, 
      showGuestbook, 
      setShowStatsBar,
      setShowGuestbook,
      toggleStatsBar, 
      toggleGuestbook, 
      subscribeBioWidgets 
    }}>
      {children}
    </WidgetsContext.Provider>
  );
}

export function useWidgets() {
  const ctx = useContext(WidgetsContext);
  if (!ctx) throw new Error('useWidgets must be used within a WidgetsProvider');
  return ctx;
}
