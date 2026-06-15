"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "../config/firebase";
import { dbService } from "../config/dbService";
import { UserDoc, UserRole } from "../types";

// Full list of reserved usernames (both from request + layout blocks)
export const RESERVED_USERNAMES = new Set([
  "www", "app", "support", "help", "docs", "privacy", "terms", "pricing",
  "explore", "settings", "profile", "home", "about", "contact",
  "login", "signup", "dashboard", "admin", "api", "themes", "auth",
  "messages", "guestbook", "system", "index", "static", "public"
]);

interface AuthContextType {
  user: UserDoc | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signup: (email: string, password: string, displayName: string, username: string) => Promise<UserDoc>;
  login: (email: string, password: string) => Promise<UserDoc>;
  loginWithGoogle: () => Promise<UserDoc>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendVerification: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserDoc | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Validate Username format and collision
  const validateUsername = async (username: string) => {
    const normalized = username.toLowerCase().trim();
    if (normalized.length < 3) {
      throw new Error("Username must be at least 3 characters long.");
    }
    if (RESERVED_USERNAMES.has(normalized)) {
      throw new Error(`The username "${username}" is a reserved system path.`);
    }
    if (!/^[a-z0-9_-]+$/.test(normalized)) {
      throw new Error("Username can only contain letters, numbers, underscores, and hyphens.");
    }
    // Check database
    const existingBio = await dbService.getBio(normalized);
    if (existingBio) {
      throw new Error("Username is already taken by another bio profile.");
    }
  };

  // Helper to determine if this is the very first user (for auto super_admin)
  const isFirstUser = async () => {
    const allUsers = await dbService.getAllUsers();
    return allUsers.length === 0;
  };

  useEffect(() => {
    if (isFirebaseConfigured) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        setFirebaseUser(fbUser);
        if (fbUser) {
          // Fetch corresponding document from Firestore
          let docData = await dbService.getUser(fbUser.uid);
          if (!docData) {
            // Re-create user document if missing
            const checkFirst = await isFirstUser();
            const role: UserRole = checkFirst ? "super_admin" : "user";
            docData = {
              uid: fbUser.uid,
              email: fbUser.email || "",
              displayName: fbUser.displayName || fbUser.email?.split("@")[0] || "Stellar Creator",
              photoURL: fbUser.photoURL || "",
              username: "",
              role,
              roles: checkFirst ? ["user", "super_admin"] : ["user"],
              verified: false,
              verificationBadgeId: "",
              verificationIcon: "",
              verifiedBy: "",
              verifiedAt: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            await dbService.createUser(docData);
          }
          setUser(docData);
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // Local Mock Mode Auth Check
      const storedSession = localStorage.getItem("genzbio_active_uid");
      if (storedSession) {
        dbService.getUser(storedSession).then((u) => {
          setUser(u);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    }
  }, []);

  const signup = async (email: string, password: string, displayName: string, username: string) => {
    setLoading(true);
    const normalizedUsername = username.toLowerCase().trim();
    await validateUsername(normalizedUsername);

    try {
      let uid = "";
      if (isFirebaseConfigured) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        uid = cred.user.uid;
        // Trigger verification email automatically
        await sendEmailVerification(cred.user);
      } else {
        uid = "mock-uid-" + Math.random().toString(36).substring(2, 9);
      }

      // Automatically promote to super_admin if this is the first user
      const checkFirst = await isFirstUser();
      const role: UserRole = checkFirst ? "super_admin" : "user";
      const roles: UserRole[] = checkFirst ? ["user", "super_admin"] : ["user"];

      const newUser: UserDoc = {
        uid,
        email,
        displayName,
        photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${normalizedUsername}`,
        username: normalizedUsername,
        role,
        roles,
        verified: checkFirst, // auto-verify super_admin
        verificationBadgeId: checkFirst ? "cosmic-creator" : "",
        verificationIcon: checkFirst ? "⚡" : "",
        verifiedBy: checkFirst ? "system" : "",
        verifiedAt: checkFirst ? new Date().toISOString() : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Create User Document
      await dbService.createUser(newUser);

      // Create primary bio for user automatically
      const defaultBio = {
        id: normalizedUsername,
        ownerId: uid,
        displayName: displayName,
        bioDescription: "Welcome to my portal in the digital universe. 🌌",
        photoURL: newUser.photoURL,
        coverURL: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=1200",
        website: "",
        socialLinks: {},
        guestbookEnabled: true,
        messagesEnabled: true,
        viewsCount: 0,
        themeId: "purple-galaxy",
        blocks: [
          {
            id: "welcome-heading",
            type: "heading" as const,
            order: 0,
            data: { text: "Nebula Core Portal", level: "h2" }
          },
          {
            id: "welcome-text",
            type: "text" as const,
            order: 1,
            data: { text: "Thanks for visiting my custom space orbit! Add content blocks and social links in the dashboard to customize this link-in-bio." }
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await dbService.createBio(defaultBio);

      if (!isFirebaseConfigured) {
        localStorage.setItem("genzbio_active_uid", uid);
      }
      
      setUser(newUser);
      return newUser;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      let uid = "";
      if (isFirebaseConfigured) {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        uid = cred.user.uid;
      } else {
        const users = JSON.parse(localStorage.getItem("genzbio_users") || "[]") as UserDoc[];
        const match = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (!match) {
          throw new Error("User credentials not found on mock database. Please sign up first.");
        }
        uid = match.uid;
      }

      const userDoc = await dbService.getUser(uid);
      if (!userDoc) {
        throw new Error("User profile document could not be resolved.");
      }

      if (userDoc.banned) {
        throw new Error("Your account has been banned by Space Command.");
      }

      if (!isFirebaseConfigured) {
        localStorage.setItem("genzbio_active_uid", uid);
      }

      setUser(userDoc);
      return userDoc;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      let uid = "";
      let email = "";
      let displayName = "";
      let photoURL = "";

      if (isFirebaseConfigured) {
        const provider = new GoogleAuthProvider();
        const cred = await signInWithPopup(auth, provider);
        uid = cred.user.uid;
        email = cred.user.email || "";
        displayName = cred.user.displayName || "Stellar Explorer";
        photoURL = cred.user.photoURL || "";
      } else {
        uid = "mock-google-uid-" + Math.random().toString(36).substring(2, 9);
        email = "google_user@domain.com";
        displayName = "Cosmic Voyager";
        photoURL = "https://api.dicebear.com/7.x/bottts/svg?seed=google";
      }

      let userDoc = await dbService.getUser(uid);
      if (!userDoc) {
        const checkFirst = await isFirstUser();
        const role: UserRole = checkFirst ? "super_admin" : "user";
        const roles: UserRole[] = checkFirst ? ["user", "super_admin"] : ["user"];
        const randUsername = "voyager_" + Math.random().toString(36).substring(2, 6);

        userDoc = {
          uid,
          email,
          displayName,
          photoURL,
          username: randUsername,
          role,
          roles,
          verified: checkFirst,
          verificationBadgeId: checkFirst ? "cosmic-creator" : "",
          verificationIcon: checkFirst ? "⚡" : "",
          verifiedBy: checkFirst ? "system" : "",
          verifiedAt: checkFirst ? new Date().toISOString() : null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await dbService.createUser(userDoc);

        // Auto create bio page
        const defaultBio = {
          id: randUsername,
          ownerId: uid,
          displayName,
          bioDescription: "Exploring the cosmos from my Link-in-Bio node.",
          photoURL,
          coverURL: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=1200",
          website: "",
          socialLinks: {},
          guestbookEnabled: true,
          messagesEnabled: true,
          viewsCount: 0,
          themeId: "purple-galaxy",
          blocks: [
            {
              id: "welcome-text",
              type: "text" as const,
              order: 0,
              data: { text: "Stardust is inside us. Welcome to my personal page. Customize this in the Space dashboard." }
            }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await dbService.createBio(defaultBio);
      }

      if (userDoc.banned) {
        throw new Error("Your account has been banned by Space Command.");
      }

      if (!isFirebaseConfigured) {
        localStorage.setItem("genzbio_active_uid", uid);
      }

      setUser(userDoc);
      return userDoc;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured) {
      await signOut(auth);
    } else {
      localStorage.removeItem("genzbio_active_uid");
    }
    setUser(null);
    setFirebaseUser(null);
  };

  const resetPassword = async (email: string) => {
    if (isFirebaseConfigured) {
      await sendPasswordResetEmail(auth, email);
    } else {
      console.log(`Mock: Password reset email dispatched to ${email}`);
    }
  };

  const sendVerification = async () => {
    if (isFirebaseConfigured && auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    } else {
      console.log("Mock: Verification email dispatched successfully.");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        signup,
        login,
        loginWithGoogle,
        logout,
        resetPassword,
        sendVerification
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be called inside an AuthProvider");
  }
  return context;
};
