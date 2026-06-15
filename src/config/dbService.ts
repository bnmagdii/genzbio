import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import { UserDoc, BioDoc, MessageDoc, GuestbookDoc, VerificationBadge, VerificationLog } from "../types";

// Helper keys for LocalStorage mock database
const KEYS = {
  USERS: "genzbio_users",
  BIOS: "genzbio_bios",
  MESSAGES: "genzbio_messages",
  GUESTBOOK: "genzbio_guestbook",
  BADGES: "genzbio_badges",
  LOGS: "genzbio_logs"
};

// LocalStorage Helper functions
const getLocalData = <T>(key: string): T[] => {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
};

const setLocalData = <T>(key: string, data: T[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
};

export const dbService = {
  // === USERS SERVICE ===
  async getUser(uid: string): Promise<UserDoc | null> {
    if (isFirebaseConfigured) {
      try {
        const docRef = doc(db, "users", uid);
        const snap = await getDoc(docRef);
        return snap.exists() ? (snap.data() as UserDoc) : null;
      } catch (e) {
        console.error("Firebase getUser error, falling back to mock:", e);
      }
    }
    const users = getLocalData<UserDoc>(KEYS.USERS);
    return users.find((u) => u.uid === uid) || null;
  },

  async createUser(user: UserDoc): Promise<void> {
    if (isFirebaseConfigured) {
      try {
        const docRef = doc(db, "users", user.uid);
        await setDoc(docRef, user);
        return;
      } catch (e) {
        console.error("Firebase createUser error, falling back to mock:", e);
      }
    }
    const users = getLocalData<UserDoc>(KEYS.USERS);
    if (!users.some((u) => u.uid === user.uid)) {
      users.push(user);
      setLocalData(KEYS.USERS, users);
    }
  },

  async updateUser(uid: string, fields: Partial<UserDoc>): Promise<void> {
    if (isFirebaseConfigured) {
      try {
        const docRef = doc(db, "users", uid);
        await updateDoc(docRef, fields as any);
        return;
      } catch (e) {
        console.error("Firebase updateUser error, falling back to mock:", e);
      }
    }
    const users = getLocalData<UserDoc>(KEYS.USERS);
    const updated = users.map((u) => (u.uid === uid ? { ...u, ...fields, updatedAt: new Date().toISOString() } : u));
    setLocalData(KEYS.USERS, updated);
  },

  async getAllUsers(): Promise<UserDoc[]> {
    if (isFirebaseConfigured) {
      try {
        const colRef = collection(db, "users");
        const snap = await getDocs(colRef);
        return snap.docs.map((doc) => doc.data() as UserDoc);
      } catch (e) {
        console.error("Firebase getAllUsers error, falling back to mock:", e);
      }
    }
    return getLocalData<UserDoc>(KEYS.USERS);
  },

  // === BIOS SERVICE ===
  async getBio(id: string): Promise<BioDoc | null> {
    const cleanId = id.toLowerCase().trim();
    if (isFirebaseConfigured) {
      try {
        const docRef = doc(db, "bios", cleanId);
        const snap = await getDoc(docRef);
        return snap.exists() ? (snap.data() as BioDoc) : null;
      } catch (e) {
        console.error("Firebase getBio error, falling back to mock:", e);
      }
    }
    const bios = getLocalData<BioDoc>(KEYS.BIOS);
    return bios.find((b) => b.id.toLowerCase().trim() === cleanId) || null;
  },

  async getBiosByOwner(ownerId: string): Promise<BioDoc[]> {
    if (isFirebaseConfigured) {
      try {
        const colRef = collection(db, "bios");
        const q = query(colRef, where("ownerId", "==", ownerId));
        const snap = await getDocs(q);
        return snap.docs.map((doc) => doc.data() as BioDoc);
      } catch (e) {
        console.error("Firebase getBiosByOwner error, falling back to mock:", e);
      }
    }
    const bios = getLocalData<BioDoc>(KEYS.BIOS);
    return bios.filter((b) => b.ownerId === ownerId);
  },

  async createBio(bio: BioDoc): Promise<void> {
    const cleanId = bio.id.toLowerCase().trim();
    const updatedBio = { ...bio, id: cleanId };
    if (isFirebaseConfigured) {
      try {
        const docRef = doc(db, "bios", cleanId);
        await setDoc(docRef, updatedBio);
        return;
      } catch (e) {
        console.error("Firebase createBio error, falling back to mock:", e);
      }
    }
    const bios = getLocalData<BioDoc>(KEYS.BIOS);
    if (!bios.some((b) => b.id === cleanId)) {
      bios.push(updatedBio);
      setLocalData(KEYS.BIOS, bios);
    }
  },

  async updateBio(id: string, fields: Partial<BioDoc>): Promise<void> {
    const cleanId = id.toLowerCase().trim();
    if (isFirebaseConfigured) {
      try {
        const docRef = doc(db, "bios", cleanId);
        await updateDoc(docRef, fields as any);
        return;
      } catch (e) {
        console.error("Firebase updateBio error, falling back to mock:", e);
      }
    }
    const bios = getLocalData<BioDoc>(KEYS.BIOS);
    const updated = bios.map((b) => (b.id === cleanId ? { ...b, ...fields, updatedAt: new Date().toISOString() } : b));
    setLocalData(KEYS.BIOS, updated);
  },

  async deleteBio(id: string): Promise<void> {
    const cleanId = id.toLowerCase().trim();
    if (isFirebaseConfigured) {
      try {
        const docRef = doc(db, "bios", cleanId);
        await deleteDoc(docRef);
        return;
      } catch (e) {
        console.error("Firebase deleteBio error, falling back to mock:", e);
      }
    }
    const bios = getLocalData<BioDoc>(KEYS.BIOS);
    const updated = bios.filter((b) => b.id !== cleanId);
    setLocalData(KEYS.BIOS, updated);
  },

  // === MESSAGES SERVICE ===
  async getMessages(bioId: string): Promise<MessageDoc[]> {
    const cleanId = bioId.toLowerCase().trim();
    if (isFirebaseConfigured) {
      try {
        const colRef = collection(db, "messages");
        const q = query(colRef, where("bioId", "==", cleanId));
        const snap = await getDocs(q);
        return snap.docs
          .map((doc) => doc.data() as MessageDoc)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } catch (e) {
        console.error("Firebase getMessages error, falling back to mock:", e);
      }
    }
    const messages = getLocalData<MessageDoc>(KEYS.MESSAGES);
    return messages
      .filter((m) => m.bioId === cleanId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async addMessage(msg: MessageDoc): Promise<void> {
    if (isFirebaseConfigured) {
      try {
        const docRef = doc(db, "messages", msg.id);
        await setDoc(docRef, msg);
        return;
      } catch (e) {
        console.error("Firebase addMessage error, falling back to mock:", e);
      }
    }
    const messages = getLocalData<MessageDoc>(KEYS.MESSAGES);
    messages.push(msg);
    setLocalData(KEYS.MESSAGES, messages);
  },

  async updateMessage(msgId: string, fields: Partial<MessageDoc>): Promise<void> {
    if (isFirebaseConfigured) {
      try {
        const docRef = doc(db, "messages", msgId);
        await updateDoc(docRef, fields as any);
        return;
      } catch (e) {
        console.error("Firebase updateMessage error:", e);
      }
    }
    const messages = getLocalData<MessageDoc>(KEYS.MESSAGES);
    const updated = messages.map((m) => (m.id === msgId ? { ...m, ...fields } : m));
    setLocalData(KEYS.MESSAGES, updated);
  },

  // === GUESTBOOK SERVICE ===
  async getGuestbook(bioId: string): Promise<GuestbookDoc[]> {
    const cleanId = bioId.toLowerCase().trim();
    if (isFirebaseConfigured) {
      try {
        const colRef = collection(db, "guestbook");
        const q = query(colRef, where("bioId", "==", cleanId));
        const snap = await getDocs(q);
        return snap.docs
          .map((doc) => doc.data() as GuestbookDoc)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } catch (e) {
        console.error("Firebase getGuestbook error, falling back to mock:", e);
      }
    }
    const entries = getLocalData<GuestbookDoc>(KEYS.GUESTBOOK);
    return entries
      .filter((e) => e.bioId === cleanId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async addGuestbookEntry(entry: GuestbookDoc): Promise<void> {
    if (isFirebaseConfigured) {
      try {
        const docRef = doc(db, "guestbook", entry.id);
        await setDoc(docRef, entry);
        return;
      } catch (e) {
        console.error("Firebase addGuestbookEntry error, falling back to mock:", e);
      }
    }
    const entries = getLocalData<GuestbookDoc>(KEYS.GUESTBOOK);
    entries.push(entry);
    setLocalData(KEYS.GUESTBOOK, entries);
  },

  // === BADGES SERVICE ===
  async getBadges(): Promise<VerificationBadge[]> {
    if (isFirebaseConfigured) {
      try {
        const colRef = collection(db, "verification_badges");
        const snap = await getDocs(colRef);
        return snap.docs.map((doc) => doc.data() as VerificationBadge);
      } catch (e) {
        console.error("Firebase getBadges error, falling back to mock:", e);
      }
    }
    const badges = getLocalData<VerificationBadge>(KEYS.BADGES);
    // Return some default mock badges if empty
    if (badges.length === 0) {
      const defaultBadges: VerificationBadge[] = [
        {
          id: "cosmic-creator",
          badgeName: "Cosmic Creator",
          iconURL: "⚡",
          createdAt: new Date().toISOString()
        },
        {
          id: "verified-gamer",
          badgeName: "Verified Gamer",
          iconURL: "🎮",
          createdAt: new Date().toISOString()
        },
        {
          id: "stellar-influencer",
          badgeName: "Stellar Influencer",
          iconURL: "✨",
          createdAt: new Date().toISOString()
        }
      ];
      setLocalData(KEYS.BADGES, defaultBadges);
      return defaultBadges;
    }
    return badges;
  },

  async addBadge(badge: VerificationBadge): Promise<void> {
    if (isFirebaseConfigured) {
      try {
        const docRef = doc(db, "verification_badges", badge.id);
        await setDoc(docRef, badge);
        return;
      } catch (e) {
        console.error("Firebase addBadge error, falling back to mock:", e);
      }
    }
    const badges = getLocalData<VerificationBadge>(KEYS.BADGES);
    if (!badges.some((b) => b.id === badge.id)) {
      badges.push(badge);
      setLocalData(KEYS.BADGES, badges);
    }
  },

  // === AUDIT LOGS ===
  async getLogs(): Promise<VerificationLog[]> {
    if (isFirebaseConfigured) {
      try {
        const colRef = collection(db, "verification_logs");
        const snap = await getDocs(colRef);
        return snap.docs
          .map((doc) => doc.data() as VerificationLog)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      } catch (e) {
        console.error("Firebase getLogs error, falling back to mock:", e);
      }
    }
    const logs = getLocalData<VerificationLog>(KEYS.LOGS);
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  async addLog(log: VerificationLog): Promise<void> {
    if (isFirebaseConfigured) {
      try {
        const docRef = doc(db, "verification_logs", log.id);
        await setDoc(docRef, log);
        return;
      } catch (e) {
        console.error("Firebase addLog error, falling back to mock:", e);
      }
    }
    const logs = getLocalData<VerificationLog>(KEYS.LOGS);
    logs.push(log);
    setLocalData(KEYS.LOGS, logs);
  }
};
