import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  deleteDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { uploadToCloudinary } from '../lib/cloudinary';
import { UserProfile, BioPageConfig, VerificationBadge } from '../types';
import {
  Shield,
  Users,
  CheckCircle,
  Globe,
  AlertTriangle,
  Sparkles,
  BarChart3,
  Settings,
  Search,
  Filter,
  UserCheck,
  Ban,
  Trash2,
  Upload,
  Image as ImageIcon,
  Check,
  X,
  FileText,
  BadgeAlert,
  Save,
  Lock,
  ArrowRight,
  RefreshCw,
  Plus
} from 'lucide-react';

interface Report {
  id: string;
  bioId: string;
  username: string;
  reason: string;
  reportedBy: string;
  createdAt: string;
  status: 'pending' | 'resolved';
}

interface AdminSettingsType {
  siteName: string;
  logo: string;
  favicon: string;
  defaultVerificationBadge: string;
  registrationToggle: boolean;
  maintenanceMode: boolean;
}

// Helper helper to convert base64 image strings to raw Blob assets
function dataURLtoBlob(dataurl: string) {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

export default function AdminPanel({ defaultTab }: { defaultTab?: 'dashboard' | 'users' | 'verified' | 'bios' | 'reports' | 'themes' | 'analytics' | 'settings' }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'verified' | 'bios' | 'reports' | 'themes' | 'analytics' | 'settings'>(defaultTab || 'dashboard');

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Core Data Lists
  const [users, setUsers] = useState<any[]>([]);
  const [bios, setBios] = useState<BioPageConfig[]>([]);
  const [badges, setBadges] = useState<VerificationBadge[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [adminSettings, setAdminSettings] = useState<AdminSettingsType>({
    siteName: 'GEN-Z BIO',
    logo: '',
    favicon: '',
    defaultVerificationBadge: 'blue-check',
    registrationToggle: true,
    maintenanceMode: false,
  });

  // User Actions / Search
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [userStatusFilter, setUserStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [editUserRole, setEditUserRole] = useState<string>('user');

  // Badge Assignment States
  const [showBadgeAssignModal, setShowBadgeAssignModal] = useState(false);
  const [userToAssignBadge, setUserToAssignBadge] = useState<any | null>(null);

  // Badge Creation / Storage Settings
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [newBadgeName, setNewBadgeName] = useState('');
  const [newBadgeIconBase64, setNewBadgeIconBase64] = useState<string>('');
  const [newBadgeFile, setNewBadgeFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [submittingBadge, setSubmittingBadge] = useState(false);

  // Dynamic Toast Notifications
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' | 'info' }[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Pagination index
  const [userPage, setUserPage] = useState(1);
  const usersPerPage = 8;

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Users
      const usersSnap = await getDocs(collection(db, 'users'));
      const usersList = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList);

      // 2. Fetch Bios
      const biosSnap = await getDocs(collection(db, 'bios'));
      const biosList = biosSnap.docs.map(doc => doc.data() as BioPageConfig);
      setBios(biosList);

      // 3. Fetch Custom Badges
      const badgesSnap = await getDocs(collection(db, 'verification_badges'));
      const badgesList = badgesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setBadges(badgesList);

      // 4. Fetch System Settings or generate defaults
      const settingsRef = doc(db, 'settings', 'admin');
      const settingsSnap = await getDoc(settingsRef);
      if (settingsSnap.exists()) {
        setAdminSettings(settingsSnap.data() as AdminSettingsType);
      } else {
        // Bootstrap defaults
        await setDoc(settingsRef, adminSettings);
      }

      // 5. Fetch mock/real reports
      const reportsSnap = await getDocs(collection(db, 'reports'));
      const reportsList = reportsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      if (reportsList.length === 0) {
        // Bootstrap a placeholder report so developer can view the interface
        const mockReport: Report = {
          id: 'report-demo',
          bioId: 'demo-bio',
          username: 'hyper_gamer',
          reason: 'Impersonating a TikTok creator and linking to unofficial feeds.',
          reportedBy: 'anon_critic',
          createdAt: new Date().toISOString(),
          status: 'pending'
        };
        setReports([mockReport]);
      } else {
        setReports(reportsList);
      }

    } catch (err: any) {
      console.error('=== [ADMIN RBAC ERROR] ===');
      console.error('Administrative data load failed due to missing or insufficient roles.');
      console.error('Current UID:', auth.currentUser?.uid);
      console.error('Current Email:', auth.currentUser?.email);
      console.error('Error Details:', err);
      console.error('==========================');
      
      // Redirect cleanly to dashboard with state parameter
      navigate('/dashboard', {
        state: {
          adminError: 'Access blocked. Ensure you are bootstrapped as super_admin.'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
        roles: [newRole],
        updatedAt: new Date().toISOString(),
      });
      setSuccess(`Successfully updated role of user to ${newRole}`);
      // Refresh local copy
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole, roles: [newRole] } : u));
      setSelectedUser(null);
    } catch (err: any) {
      console.error(err);
      setError('Failed to update roles. Permission Denied.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleBanUser = async (userId: string, currentBanned: boolean) => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', userId), {
        banned: !currentBanned,
        updatedAt: new Date().toISOString(),
      });
      setSuccess(`User status changed successfully`);
      setUsers(users.map(u => u.id === userId ? { ...u, banned: !currentBanned } : u));
    } catch (err) {
      console.error(err);
      setError('Operation failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you absolutely sure you want to delete this user? This cannot be undone.')) return;
    setSaving(true);
    try {
      await deleteDoc(doc(db, 'users', userId));
      setSuccess(`User deleted successfully`);
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      console.error(err);
      setError('Failed to delete user doc.');
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyUser = async (userId: string, badgeId?: string, badgeIconUrl?: string) => {
    setSaving(true);
    try {
      const adminId = auth.currentUser?.uid || '';
      const finalBadgeId = badgeId || 'default-check';
      const finalIconUrl = badgeIconUrl || `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23a855f7" width="24" height="24"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`;
      
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        verified: true,
        verificationBadgeId: finalBadgeId,
        verificationIcon: finalIconUrl,
        verifiedAt: new Date().toISOString(),
        verifiedBy: adminId
      });

      // Write Log
      const logRef = doc(collection(db, 'verification_logs'));
      await setDoc(logRef, {
        userId,
        adminId,
        action: 'verified',
        createdAt: new Date().toISOString()
      });

      // Sync to owner's bio documents
      try {
        const q = query(collection(db, 'bios'), where('ownerId', '==', userId));
        const bioSnap = await getDocs(q);
        for (const bioDoc of bioSnap.docs) {
          await updateDoc(bioDoc.ref, {
             verified: true,
             verificationBadgeId: finalBadgeId,
             verificationIcon: finalIconUrl
          });
        }
      } catch (err) {
        console.warn("Could not sync verification status to bios:", err);
      }

      showToast('Creator verified successfully!', 'success');
      
      // Update local state
      setUsers(users.map(u => u.id === userId ? {
        ...u,
        verified: true,
        verificationBadgeId: finalBadgeId,
        verificationIcon: finalIconUrl,
        verifiedAt: new Date().toISOString(),
        verifiedBy: adminId
      } : u));
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Verification failed. Permission Denied.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveVerification = async (userId: string) => {
    setSaving(true);
    try {
      const adminId = auth.currentUser?.uid || '';
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        verified: false,
        verificationBadgeId: '',
        verificationIcon: '',
        verifiedAt: null,
        verifiedBy: null
      });

      // Write Log
      const logRef = doc(collection(db, 'verification_logs'));
      await setDoc(logRef, {
        userId,
        adminId,
        action: 'removed',
        createdAt: new Date().toISOString()
      });

      // Sync to owner's bio documents
      try {
        const q = query(collection(db, 'bios'), where('ownerId', '==', userId));
        const bioSnap = await getDocs(q);
        for (const bioDoc of bioSnap.docs) {
          await updateDoc(bioDoc.ref, {
             verified: false,
             verificationBadgeId: '',
             verificationIcon: ''
          });
        }
      } catch (err) {
        console.warn("Could not sync verification removal to bios:", err);
      }

      showToast('Verification revoked successfully', 'success');

      setUsers(users.map(u => u.id === userId ? {
        ...u,
        verified: false,
        verificationBadgeId: '',
        verificationIcon: '',
        verifiedAt: null,
        verifiedBy: null
      } : u));
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to remove verification.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Manage Badge uploads
  const handleBadgeIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('Badge icon cannot exceed 10MB limit.');
      showToast('Badge icon cannot exceed 10MB limit.', 'error');
      return;
    }

    setNewBadgeFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setNewBadgeIconBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Step 1: Validate form
    if (!newBadgeName.trim()) {
      setError('Badge name is required.');
      showToast('Badge name is required.', 'error');
      return;
    }
    if (!newBadgeFile && !newBadgeIconBase64) {
      setError('Badge image is required.');
      showToast('Badge image is required. Please upload an icon.', 'error');
      return;
    }

    // Role verification: Verify currentUser.role === "super_admin" before proceeding
    try {
      console.log("Checking super admin permissions...");
      const currentUserDocRef = doc(db, 'users', auth.currentUser?.uid || '');
      const currentUserSnap = await getDoc(currentUserDocRef);
      const currentUserData = currentUserSnap.exists() ? currentUserSnap.data() : null;
      const userRole = currentUserData?.role || 'user';
      const userRoles = currentUserData?.roles || [];

      if (userRole !== 'super_admin' && !userRoles.includes('super_admin')) {
        setError('You do not have permission to create badges.');
        showToast('You do not have permission to create badges.', 'error');
        return;
      }

      setSubmittingBadge(true);
      setUploadProgress(0);
      console.log("Super admin permission confirmed. Preparing image upload...");
      
      const badgeId = 'badge_' + Date.now();

      // Prepare target for upload
      let fileToUpload: Blob | File;
      let filename = 'badge-icon.png';

      if (newBadgeFile) {
        fileToUpload = newBadgeFile;
        filename = newBadgeFile.name;
      } else {
        fileToUpload = dataURLtoBlob(newBadgeIconBase64);
      }

      // Step 2: Upload image to Cloudinary
      const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
      console.log("Starting Cloudinary upload task...");

      const uploadTask = uploadToCloudinary(fileToUpload, cleanFilename, 'admin-badge-upload', (progress) => {
        setUploadProgress(progress);
      });

      // Absolute timeout of 30 seconds for the entire process:
      let timerId: any;
      const timeoutPromise = new Promise<never>((_, reject) => {
        timerId = setTimeout(() => {
          try {
            console.warn("Upload timed out after 30 seconds. Attempting to cancel task...");
            uploadTask.cancel();
          } catch (cancelErr) {
            console.error("Failed to cancel upload task:", cancelErr);
          }
          reject(new Error("UPLOAD_TIMEOUT"));
        }, 30000);
      });

      // Race the full upload task against our absolute 30s timeout
      const downloadURL = await Promise.race([uploadTask.promise, timeoutPromise]);
      clearTimeout(timerId);

      console.log("Creating badge document in Firestore...");

      // Step 4: Create Firestore document
      const newBadge = {
        name: newBadgeName.trim(),
        iconUrl: downloadURL,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: auth.currentUser?.uid || 'unknown'
      };

      await setDoc(doc(db, 'verification_badges', badgeId), newBadge);
      console.log("Badge created successfully.");

      // Refresh badge list locals comfortably with local dates
      const localBadgeData = {
        id: badgeId,
        name: newBadgeName.trim(),
        iconUrl: downloadURL,
        createdAt: new Date().toISOString(),
        createdBy: auth.currentUser?.uid || 'unknown'
      };
      setBadges([...badges, localBadgeData]);

      // Reset form states
      setNewBadgeName('');
      setNewBadgeIconBase64('');
      setNewBadgeFile(null);
      setUploadProgress(null);
      setShowBadgeModal(false);

      // Toast Success
      setSuccess("Badge published successfully.");
      showToast("Badge published successfully.", "success");

    } catch (err: any) {
      console.error("Badge upload failed:", err);
      setUploadProgress(null);

      if (err.message === "UPLOAD_TIMEOUT" || err.message === "TIMEOUT" || err.message?.includes("cancel")) {
        setError("Upload timed out after 30 seconds. Please try again.");
        showToast("Upload timed out. Please try again.", "error");
        return;
      }

      // Check for Firebase Storage upload error
      if (err.code && err.code.startsWith('storage/')) {
        setError("Failed to upload image.");
        showToast("Failed to upload image.", "error");
      } else {
        const readableError = err.message || JSON.stringify(err);
        setError(readableError);
        showToast(readableError, "error");
      }
    } finally {
      // Always stop loading in finally()
      setSubmittingBadge(false);
    }
  };

  const handleDeleteBadge = async (badgeId: string) => {
    if (!window.confirm('Delete this badge? Custom verification metrics might fallback to standard.')) return;
    try {
      await deleteDoc(doc(db, 'verification_badges', badgeId));
      setBadges(badges.filter(b => b.id !== badgeId));
      setSuccess('Badge deleted successfully.');
    } catch (err) {
      console.error(err);
      setError('Failed to delete badge.');
    }
  };

  const handleAssignBadge = async (userId: string, badgeId: string, badgeUrl: string) => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', userId), {
        verified: badgeId !== 'none',
        verificationBadgeId: badgeId === 'none' ? '' : badgeId,
        verificationIcon: badgeId === 'none' ? '' : badgeUrl,
        updatedAt: new Date().toISOString(),
      });
      setSuccess('Verification badge assigned successfully.');
      setUsers(users.map(u => u.id === userId ? {
        ...u,
        verified: badgeId !== 'none',
        verificationBadgeId: badgeId === 'none' ? '' : badgeId,
        verificationIcon: badgeId === 'none' ? '' : badgeUrl
      } : u));
    } catch (err) {
      console.error(err);
      setError('Failed to assign badge.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await setDoc(doc(db, 'settings', 'admin'), adminSettings);
      setSuccess('Admin configurations persisted successfully!');
    } catch (err) {
      console.error(err);
      setError('Failed to save general configurations.');
    } finally {
      setSaving(false);
    }
  };

  const handleResolveReport = async (reportId: string) => {
    try {
      await updateDoc(doc(db, 'reports', reportId), { status: 'resolved' });
      setReports(reports.map(r => r.id === reportId ? { ...r, status: 'resolved' } : r));
      setSuccess('Report resolved successfully.');
    } catch (err) {
      console.error(err);
      setError('Failed to resolve report.');
    }
  };

  // Filters & Search computations
  const filteredUsers = users.filter((u) => {
    const sTerm = userSearch.toLowerCase();
    const matchesSearch =
      (u.email || '').toLowerCase().includes(sTerm) ||
      (u.displayName || '').toLowerCase().includes(sTerm) ||
      (u.id || '').toLowerCase().includes(sTerm);

    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchesStatus =
      userStatusFilter === 'all' ||
      (userStatusFilter === 'banned' && u.banned) ||
      (userStatusFilter === 'verified' && u.verified) ||
      (userStatusFilter === 'active' && !u.banned);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination bounds
  const indexOfLastUser = userPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalUserPages = Math.ceil(filteredUsers.length / usersPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06080F] flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-500 mx-auto" />
          <p className="text-xs text-zinc-400 font-bold tracking-widest uppercase">Validating Admin Token...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white font-sans flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#060a13] border-r border-white/5 p-6 shrink-0 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-500 to-cyan-400 flex items-center justify-center text-white font-black text-sm">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="font-black text-xs tracking-widest text-white leading-none uppercase">GEN-Z CORE</p>
              <p className="text-[9px] text-purple-400 font-bold uppercase tracking-wider mt-0.5">Admin Headquarters</p>
            </div>
          </div>

          <nav className="space-y-1.5Grid">
            {[
              { id: 'dashboard', label: 'Overview', icon: BarChart3 },
              { id: 'users', label: 'User Index', icon: Users },
              { id: 'verified', label: 'Badge Control', icon: CheckCircle },
              { id: 'bios', label: 'Creator Bios', icon: Globe },
              { id: 'reports', label: 'Reports Hub', icon: BadgeAlert },
              { id: 'settings', label: 'Platform Config', icon: Settings },
            ].map((tab) => {
              const IconComp = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full text-left cursor-pointer flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-950/40 via-purple-900/10 to-transparent text-purple-300 border border-purple-500/10'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.02]'
                  }`}
                >
                  <IconComp className="w-4 h-4 text-purple-400 shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-white/5 text-[10px] text-zinc-500 space-y-2">
          <p>Auth Status: <span className="text-purple-400 font-bold uppercase">Super User</span></p>
          <p>Session ID: <span className="font-mono">{auth.currentUser?.uid.slice(0, 8)}...</span></p>
          <button
            onClick={() => window.location.href = '#/dashboard'}
            className="w-full mt-2 cursor-pointer bg-white/5 hover:bg-white/10 text-white font-bold py-2 rounded-xl text-center text-[10px] uppercase border border-white/10 transition-colors"
          >
            ← Back to App
          </button>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
        
        {/* Alerts Block */}
        {error && (
          <div className="mb-6 flex gap-2 w-full p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs animate-fade-in relative">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <div>
              <p className="font-semibold uppercase tracking-wider">Access Restricted / Error</p>
              <p className="text-[11px] text-zinc-300 mt-0.5">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="absolute top-4 right-4 text-zinc-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 flex gap-2 w-full p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-xs animate-fade-in relative">
            <Check className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            <div>
              <p className="font-semibold uppercase tracking-wider">Operation Succeeded</p>
              <p className="text-[11px] text-zinc-300 mt-0.5">{success}</p>
            </div>
            <button onClick={() => setSuccess(null)} className="absolute top-4 right-4 text-zinc-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ======================================================= */}
        {/* DASHBOARD TAB OVERVIEW */}
        {/* ======================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h1 className="text-3xl font-black text-white">System Analytics</h1>
              <p className="text-zinc-500 text-xs mt-0.5">Core platform database monitoring, registers and telemetry metrics.</p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
              <div className="p-6 bg-[#090d16] border border-white/5 rounded-2xl relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-purple-500/10 p-2 rounded-xl text-purple-400">
                  <Users className="w-5 h-5" />
                </div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Registered Users</p>
                <p className="text-3xl font-black mt-2 text-white">{users.length}</p>
              </div>

              <div className="p-6 bg-[#090d16] border border-white/5 rounded-2xl relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-pink-500/10 p-2 rounded-xl text-pink-400">
                  <Globe className="w-5 h-5" />
                </div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Active Bios Slugs</p>
                <p className="text-3xl font-black mt-2 text-white">{bios.length}</p>
              </div>

              <div className="p-6 bg-[#090d16] border border-white/5 rounded-2xl relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-cyan-400/10 p-2 rounded-xl text-cyan-400">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Verified Accounts</p>
                <p className="text-3xl font-black mt-2 text-white">{users.filter(u => u.verified).length}</p>
              </div>

              <div className="p-6 bg-[#090d16] border border-white/5 rounded-2xl relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-amber-500/10 p-2 rounded-xl text-amber-400">
                  <BadgeAlert className="w-5 h-5" />
                </div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Inbound Reports</p>
                <p className="text-3xl font-black mt-2 text-white">{reports.filter(r => r.status === 'pending').length}</p>
              </div>
            </div>

            {/* Recent Activations Overlay */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-6 bg-[#090d16] border border-white/5 rounded-2xl space-y-4">
                <h3 className="font-extrabold text-sm uppercase text-zinc-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" /> Recent Registrations
                </h3>
                <div className="divide-y divide-white/5">
                  {users.slice(-4).reverse().map((u, i) => (
                    <div key={i} className="py-3 flex justify-between items-center">
                      <div>
                        <p className="text-xs font-bold text-white leading-none">{u.displayName || 'Anonymous Creator'}</p>
                        <p className="text-[9px] text-zinc-500 font-mono mt-1">{u.email}</p>
                      </div>
                      <span className="text-[10px] bg-purple-950/30 text-purple-400 border border-purple-500/15 py-0.5 px-2 rounded-full font-mono font-black uppercase">
                        {u.role || 'user'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-[#090d16] border border-white/5 rounded-2xl space-y-4">
                <h3 className="font-extrabold text-sm uppercase text-zinc-300 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" /> Recent Bio Publications
                </h3>
                <div className="divide-y divide-white/5">
                  {bios.slice(-4).reverse().map((b, i) => (
                    <div key={i} className="py-3 flex justify-between items-center">
                      <div>
                        <p className="text-xs font-bold text-white leading-none font-mono">/{b.username}</p>
                        <p className="text-[9px] text-zinc-500 mt-1">Hits: {b.visitorCount} views</p>
                      </div>
                      <a
                        href={`#/${b.username}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-cyan-400 font-black tracking-wider uppercase hover:underline"
                      >
                        Launch
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* USERS INDEX TAB */}
        {/* ======================================================= */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-white">User Index</h1>
                <p className="text-zinc-500 text-xs mt-0.5">Manage administrative roles, activate, ban or delete profiles.</p>
              </div>
            </div>

            {/* Filter Hub */}
            <div className="p-4 bg-[#090d16] border border-white/5 rounded-2xl flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search creators by name, email or UID..."
                  value={userSearch}
                  onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
                  className="w-full bg-white/[0.01] border border-white/10 text-xs rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
                <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
              </div>
              <div className="flex gap-2 shrink-0">
                <select
                  value={userRoleFilter}
                  onChange={(e) => { setUserRoleFilter(e.target.value); setUserPage(1); }}
                  className="bg-white/[0.01] border border-white/10 rounded-xl px-3 text-xs text-zinc-300 focus:outline-none font-bold uppercase"
                >
                  <option value="all" className="bg-[#090d16]">All Roles</option>
                  <option value="user" className="bg-[#090d16]">User</option>
                  <option value="admin" className="bg-[#090d16]">Admin</option>
                  <option value="super_admin" className="bg-[#090d16]">Super Admin</option>
                  <option value="moderator" className="bg-[#090d16]">Moderator</option>
                </select>
                <select
                  value={userStatusFilter}
                  onChange={(e) => { setUserStatusFilter(e.target.value); setUserPage(1); }}
                  className="bg-white/[0.01] border border-white/10 rounded-xl px-3 text-xs text-zinc-300 focus:outline-none font-bold uppercase"
                >
                  <option value="all" className="bg-[#090d16]">All Status</option>
                  <option value="active" className="bg-[#090d16]">Active</option>
                  <option value="verified" className="bg-[#090d16]">Verified</option>
                  <option value="banned" className="bg-[#090d16]">Banned</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-[#090d16] border border-white/5 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] text-zinc-500 uppercase font-black tracking-widest bg-white/[0.01]">
                      <th className="p-4">Creator / UID</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Security Role</th>
                      <th className="p-4">Verification</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {currentUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={u.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${u.id}`}
                              alt=""
                              className="w-8 h-8 rounded-full border border-white/10 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-extrabold text-white leading-none">{u.displayName || 'No Name'}</p>
                              <p className="text-[9px] text-zinc-500 font-mono mt-1 mt-0.5 truncate max-w-[120px]">{u.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-zinc-300">{u.email}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase border ${
                            u.role === 'super_admin' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                            u.role === 'admin' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' :
                            u.role === 'moderator' ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' :
                            'bg-zinc-800/40 border-zinc-700/30 text-zinc-400'
                          }`}>
                            {u.role || 'user'}
                          </span>
                        </td>
                        <td className="p-4">
                          {u.verified ? (
                            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold text-[10px]">
                              {u.verificationIcon ? (
                                <img src={u.verificationIcon} alt="" className="w-4 h-4 object-contain rounded-full" />
                              ) : (
                                <CheckCircle className="w-3.5 h-3.5" />
                              )}
                              <span>Verified Check</span>
                            </div>
                          ) : (
                            <span className="text-zinc-500 text-[10px]">None</span>
                          )}
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          {/* Core Management Actions */}
                          <div className="flex justify-end gap-1.5 mb-1.5">
                            <button
                              onClick={() => { setSelectedUser(u); setEditUserRole(u.role || 'user'); }}
                              className="bg-purple-950/30 hover:bg-purple-900/40 border border-purple-800/20 text-purple-300 py-1 px-2.5 rounded-lg font-bold text-[10px] uppercase cursor-pointer"
                            >
                              Edit Role
                            </button>
                            <button
                              onClick={() => handleToggleBanUser(u.id, u.banned || false)}
                              className={`py-1 px-2.5 rounded-lg font-bold text-[10px] uppercase cursor-pointer border ${
                                u.banned
                                  ? 'bg-emerald-950/30 border-emerald-800/20 text-emerald-400 hover:bg-emerald-900/40'
                                  : 'bg-red-950/30 border-red-800/20 text-red-400 hover:bg-red-900/40'
                              }`}
                            >
                              {u.banned ? 'Unban' : 'Ban'}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="bg-zinc-900/40 hover:bg-red-950/30 border border-red-900/35 text-red-400 p-1 rounded-lg cursor-pointer animate-pulse"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Owner-Controlled Verification Actions */}
                          <div className="flex justify-end gap-1.5">
                            {!u.verified ? (
                              <button
                                onClick={() => handleVerifyUser(u.id)}
                                className="bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-800/30 text-cyan-400 py-1 px-2.5 rounded-lg font-bold text-[10px] uppercase cursor-pointer transition-transform active:scale-95"
                              >
                                Verify User
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRemoveVerification(u.id)}
                                className="bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/30 text-rose-400 py-1 px-2.5 rounded-lg font-bold text-[10px] uppercase cursor-pointer transition-transform active:scale-95"
                              >
                                Remove Verification
                              </button>
                            )}
                            <button
                              onClick={() => { setUserToAssignBadge(u); setShowBadgeAssignModal(true); }}
                              className="bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-800/30 text-indigo-400 py-1 px-2.5 rounded-lg font-bold text-[10px] uppercase cursor-pointer transition-transform active:scale-95"
                            >
                              Assign Badge
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {currentUsers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-zinc-500 uppercase tracking-widest font-black text-xs">
                          No matching creators indexed
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Paginate control footer */}
              {totalUserPages > 1 && (
                <div className="p-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400 font-bold bg-white/[0.01]">
                  <p>Page {userPage} of {totalUserPages}</p>
                  <div className="flex gap-1">
                    <button
                      disabled={userPage === 1}
                      onClick={() => setUserPage(userPage - 1)}
                      className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-white text-[10px] uppercase tracking-wider font-extrabold disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Prev
                    </button>
                    <button
                      disabled={userPage === totalUserPages}
                      onClick={() => setUserPage(userPage + 1)}
                      className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-white text-[10px] uppercase tracking-wider font-extrabold disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Edit Roles Dialog Overlay */}
            {selectedUser && (
              <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
                <div className="w-full max-w-sm bg-[#090d16] border border-white/10 p-6 rounded-3xl space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-black bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent uppercase tracking-wider">Modify Security Roles</h3>
                    <p className="text-[11px] text-zinc-400 mt-1">Select authorization privileges for {selectedUser.displayName || selectedUser.email}</p>
                  </div>

                  <div className="space-y-3 pt-2">
                    {['user', 'moderator', 'admin', 'super_admin'].map((roleOpt) => (
                      <button
                        key={roleOpt}
                        onClick={() => setEditUserRole(roleOpt)}
                        className={`w-full text-left py-2.5 px-4 rounded-xl border text-xs font-bold uppercase transition-colors ${
                          editUserRole === roleOpt
                            ? 'bg-purple-950/50 border-purple-500 text-purple-300'
                            : 'bg-[#030712] border-white/5 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {roleOpt}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="w-1/2 py-2 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl text-center text-xs uppercase cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleUpdateUserRole(selectedUser.id, editUserRole)}
                      disabled={saving}
                      className="w-1/2 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl text-center text-xs uppercase cursor-pointer flex items-center justify-center gap-1"
                    >
                      {saving && <RefreshCw className="w-3 h-3 animate-spin" />}
                      <span>Apply Role</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================= */}
        {/* VERIFIED ACCOUNTS TAB & CUSTOM BADGES */}
        {/* ======================================================= */}
        {activeTab === 'verified' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-white">Badge and Verification Control</h1>
                <p className="text-zinc-500 text-xs mt-0.5">Define custom verification badges, assign premium verified checks, or upload SVG vector assets.</p>
              </div>
              <button
                onClick={() => { setShowBadgeModal(true); setError(null); }}
                className="cursor-pointer bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xs uppercase tracking-wider py-3 px-5 rounded-xl flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Create Custom Badge
              </button>
            </div>

            {/* Badges Collection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Default Badge Card (System Standard) */}
              <div className="p-6 bg-[#090d16] border border-cyan-500/10 rounded-2xl space-y-4 relative">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20">
                    <CheckCircle className="w-6 h-6 text-cyan-400" />
                  </div>
                  <span className="text-[9px] bg-cyan-950/40 text-cyan-400 border border-cyan-500/20 py-0.5 px-2 rounded-full uppercase font-mono font-bold">
                    SYSTEM DEFAULT
                  </span>
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-sm">Standard Verification Badge</h4>
                  <p className="text-[10px] text-zinc-500 mt-1">Default blue/cyan check badge assigned to verified creators.</p>
                </div>
              </div>

              {/* Dynamic Badges from Firestore */}
              {badges.map((badge) => (
                <div key={badge.id} className="p-6 bg-[#090d16] border border-white/5 rounded-2xl space-y-4 relative">
                  <button
                    onClick={() => handleDeleteBadge(badge.id)}
                    className="absolute top-4 right-4 text-zinc-600 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20 overflow-hidden">
                      {badge.iconUrl ? (
                        <img src={badge.iconUrl} alt="" className="w-10 h-10 object-contain rounded-full" />
                      ) : (
                        <CheckCircle className="w-6 h-6 text-purple-400" />
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-sm">{badge.name}</h4>
                    <p className="text-[10px] text-zinc-500 mt-1">Creator Badge • Added by {badge.createdBy}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Assign Badges to Users */}
            <div className="bg-[#090d16] border border-white/5 rounded-2xl p-6 space-y-4">
              <h3 className="font-extrabold text-sm uppercase text-zinc-300">Assign Badge to Creator Accounts</h3>
              <div className="divide-y divide-white/5">
                {users.slice(0, 10).map((u) => (
                  <div key={u.id} className="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <p className="text-xs font-bold text-white">{u.displayName || 'No Name'} ({u.email})</p>
                      <p className="text-[10px] text-zinc-500 mt-1">Current Badge: <span className="text-cyan-400 font-bold">{u.verified ? (u.verificationBadgeId || 'Default Standard') : 'None'}</span></p>
                    </div>
                    <div className="flex gap-2 bg-black/40 p-1.5 rounded-xl border border-white/5 shrink-0">
                      <button
                        onClick={() => handleAssignBadge(u.id, 'none', '')}
                        className="py-1 px-2.5 rounded-lg text-[9px] font-black uppercase tracking-wider text-zinc-400 hover:text-white"
                      >
                        Revoke Box
                      </button>
                      <button
                        onClick={() => handleAssignBadge(u.id, 'blue-check', '')}
                        className="py-1 px-2.5 bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-500/20 rounded-lg text-[9px] font-black uppercase tracking-wider text-cyan-400"
                      >
                        Default Blue
                      </button>
                      {badges.map((b) => (
                        <button
                          key={b.id}
                          onClick={() => handleAssignBadge(u.id, b.id, b.iconUrl)}
                          className="py-1 px-2.5 bg-purple-950/45 hover:bg-purple-900/40 border border-purple-500/20 rounded-lg text-[9px] font-black uppercase tracking-wider text-purple-400 hover:text-purple-300"
                        >
                          {b.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Recognition Badge Dialog Overlay */}
            {showBadgeModal && (
              <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
                <div className="w-full max-w-md bg-[#090d16] border border-white/10 p-8 rounded-3xl space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent uppercase tracking-wider">Add Creator Badge</h3>
                    <p className="text-xs text-zinc-400 mt-1">Upload an image file (PNG, ICO, SVG, WEBP) to store as custom rewards.</p>
                  </div>

                  <form onSubmit={handleCreateBadge} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold tracking-wider uppercase text-neutral-400 mb-1.5">Official Badge Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Creator Award, Gold Star, Business Tick"
                        value={newBadgeName}
                        onChange={(e) => setNewBadgeName(e.target.value)}
                        className="w-full bg-[#030712] border border-white/10 text-xs rounded-xl py-3 px-4 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold tracking-wider uppercase text-neutral-400 mb-1.5">Badge Icon (Square recommended)</label>
                      <div className="border border-dashed border-white/10 rounded-2xl p-6 text-center space-y-4 hover:border-purple-500 transition-colors relative cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBadgeIconChange}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        {newBadgeIconBase64 ? (
                          <div className="flex flex-col items-center">
                            <img src={newBadgeIconBase64} alt="" className="w-12 h-12 object-contain rounded-full" />
                            <p className="text-[10px] text-emerald-400 font-bold mt-2 uppercase">Image loaded successfully</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Upload className="w-8 h-8 text-zinc-500 mx-auto" />
                            <p className="text-xs text-zinc-400">Drag & Drop or Click to browse</p>
                            <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-extrabold max-w-[200px] mx-auto">Supported formats: PNG, ICO, SVG, WEBP (Max 10MB)</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Upload progress indicator */}
                    {uploadProgress !== null && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between items-center text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                          <span>Uploading Icon...</span>
                          <span className="text-purple-400 font-mono">{uploadProgress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-400 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowBadgeModal(false)}
                        className="w-1/2 py-3.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl text-center text-xs uppercase cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submittingBadge}
                        className="w-1/2 py-3.5 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold rounded-2xl text-center text-xs uppercase cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {submittingBadge && <RefreshCw className="w-4 h-4 animate-spin" />}
                        <span>Publish Badge</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================= */}
        {/* CREATOR BIOS LIST TAB */}
        {/* ======================================================= */}
        {activeTab === 'bios' && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h1 className="text-3xl font-black text-white">Created Bios pages</h1>
              <p className="text-zinc-500 text-xs mt-0.5">Moderate creator index pages and view published slug directories.</p>
            </div>

            <div className="bg-[#090d16] border border-white/5 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] text-zinc-500 uppercase font-black tracking-widest bg-white/[0.01]">
                    <th className="p-4">Bio Slug / Name</th>
                    <th className="p-4">Owner UID</th>
                    <th className="p-4">Publish state</th>
                    <th className="p-4">Total views</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {bios.map((b) => (
                    <tr key={b.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center font-black text-xs">
                            {b.username ? b.username[0].toUpperCase() : '/'}
                          </div>
                          <div>
                            <p className="font-extrabold text-white leading-none font-mono">/{b.username}</p>
                            <p className="text-[10px] text-zinc-500 mt-1">{b.displayName || 'No Display Name'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-zinc-400">{b.ownerId}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase border ${
                          b.published ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        }`}>
                          {b.published ? 'PUBLISHED' : 'DRAFT'}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-white font-mono">{b.visitorCount} HITS</td>
                      <td className="p-4 text-right">
                        <a
                          href={`#/${b.username}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] bg-white/5 hover:bg-white/10 text-white font-black py-1 px-3 rounded-lg uppercase tracking-wider transition-colors inline-block"
                        >
                          Launch Inspect
                        </a>
                      </td>
                    </tr>
                  ))}
                  {bios.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-zinc-500 uppercase font-mono tracking-widest font-black text-xs">
                        No bios registered on network
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* COMPREHENSIVE PLATFORM SYSTEM CONFIGURATION */}
        {/* ======================================================= */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="space-y-8 animate-fade-in">
            <div>
              <h1 className="text-3xl font-black text-white">Platform Configurations</h1>
              <p className="text-zinc-500 text-xs mt-0.5">Manage administrative setups, maintenance mode nodes, and global assets.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Site Metrics Settings Form */}
              <div className="lg:col-span-8 p-6 bg-[#090d16] border border-white/5 rounded-2xl space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Site Name (Core Title)</label>
                    <input
                      type="text"
                      required
                      value={adminSettings.siteName}
                      onChange={(e) => setAdminSettings({ ...adminSettings, siteName: e.target.value })}
                      placeholder="e.g. GEN-Z BIO"
                      className="w-full bg-[#030712] border border-white/10 text-xs rounded-xl py-3 px-4 focus:border-purple-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">System Logo Icon</label>
                    <input
                      type="text"
                      value={adminSettings.logo}
                      onChange={(e) => setAdminSettings({ ...adminSettings, logo: e.target.value })}
                      placeholder="URL to icon image"
                      className="w-full bg-[#030712] border border-white/10 text-xs rounded-xl py-3 px-4 focus:border-purple-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Favicon Shortcut Link</label>
                    <input
                      type="text"
                      value={adminSettings.favicon}
                      onChange={(e) => setAdminSettings({ ...adminSettings, favicon: e.target.value })}
                      placeholder="URL to .ico or asset"
                      className="w-full bg-[#030712] border border-white/10 text-xs rounded-xl py-3 px-4 focus:border-purple-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Default Verification ID</label>
                    <input
                      type="text"
                      value={adminSettings.defaultVerificationBadge}
                      onChange={(e) => setAdminSettings({ ...adminSettings, defaultVerificationBadge: e.target.value })}
                      placeholder="badge_xxx or blue-check"
                      className="w-full bg-[#030712] border border-white/10 text-xs rounded-xl py-3 px-4 focus:border-purple-500 focus:outline-none transition-colors animate-pulse"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 space-y-4">
                  <h4 className="font-extrabold text-sm text-zinc-300 uppercase">Operational System Toggles</h4>
                  
                  <div className="flex justify-between items-center py-2">
                    <div>
                      <p className="text-xs font-bold text-white">Registration Toggle</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Permit new creators to create and claim slugs on this instance.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAdminSettings({ ...adminSettings, registrationToggle: !adminSettings.registrationToggle })}
                      className={`py-1.5 px-3 rounded-lg text-xs font-bold uppercase border transition-colors cursor-pointer ${
                        adminSettings.registrationToggle
                          ? 'bg-emerald-950/30 border-emerald-500/20 text-emerald-400'
                          : 'bg-red-950/30 border-red-500/20 text-red-500'
                      }`}
                    >
                      {adminSettings.registrationToggle ? 'ACTIVE (OPEN)' : 'CLOSED (RESTRICTED)'}
                    </button>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <div>
                      <p className="text-xs font-bold text-white">Maintenance Mode Toggle</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Serve a unified offline overlay notice to users during server updates.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAdminSettings({ ...adminSettings, maintenanceMode: !adminSettings.maintenanceMode })}
                      className={`py-1.5 px-3 rounded-lg text-xs font-bold uppercase border transition-colors cursor-pointer ${
                        adminSettings.maintenanceMode
                          ? 'bg-amber-950/30 border-amber-500/20 text-amber-400 animate-pulse'
                          : 'bg-zinc-800/20 border-white/5 text-zinc-500'
                      }`}
                    >
                      {adminSettings.maintenanceMode ? 'ACTIVE (OFFLINE)' : 'INACTIVE (ONLINE)'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full cursor-pointer bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-black text-xs uppercase py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 tracking-widest shadow-lg shadow-purple-950/20"
                >
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Config Settings</span>
                </button>
              </div>

              {/* Informational Side Column */}
              <div className="lg:col-span-4 p-6 bg-[#090d16] border border-white/5 rounded-2xl space-y-4">
                <Lock className="w-8 h-8 text-purple-400" />
                <h4 className="font-extrabold text-white text-sm">Security Node Information</h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  These global parameters are saved inside Firestore at `/settings/admin`. These settings are protected by strict cloud security checks, preventing non-admin user tokens from making adjustments.
                </p>
              </div>
            </div>
          </form>
        )}

        {/* ======================================================= */}
        {/* INBOUND DISCORD/SECURITY REPORTS HUB */}
        {/* ======================================================= */}
        {activeTab === 'reports' && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h1 className="text-3xl font-black text-white">Security Report Logs</h1>
              <p className="text-zinc-500 text-xs mt-0.5">Moderate complaints, flag claims, or inspect user reported content.</p>
            </div>

            <div className="bg-[#090d16] border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
              {reports.map((report) => (
                <div key={report.id} className="p-6 space-y-3 relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                        report.status === 'resolved'
                          ? 'bg-emerald-950/40 border-emerald-500/10 text-emerald-400'
                          : 'bg-red-950/40 border-red-500/10 text-red-400 animate-pulse'
                      }`}>
                        {report.status}
                      </span>
                      <h4 className="font-mono font-black text-white text-sm mt-2">Claim on Bio Slug: /{report.username}</h4>
                      <p className="text-[10px] text-zinc-500 mt-1">Submitted by: {report.reportedBy} • Claim ID: {report.id}</p>
                    </div>
                    {report.status === 'pending' && (
                      <button
                        onClick={() => handleResolveReport(report.id)}
                        className="py-1 px-3 bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-800/10 text-emerald-400 text-[10px] font-bold uppercase rounded-lg cursor-pointer"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed max-w-3xl bg-black/40 p-4 rounded-xl border border-white/5">
                    {report.reason}
                  </p>
                </div>
              ))}
              {reports.length === 0 && (
                <p className="p-8 text-center text-zinc-500 font-mono text-xs uppercase tracking-widest leading-none">Security clean. Zero reports logged.</p>
              )}
            </div>
          </div>
        )}

      </main>

      {/* Assign custom badge Modal overlay */}
      {showBadgeAssignModal && userToAssignBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-[#090d16] border border-white/10 rounded-2xl p-6 space-y-6 shadow-2xl relative">
            <button 
              onClick={() => { setShowBadgeAssignModal(false); setUserToAssignBadge(null); }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div>
              <h3 className="text-lg font-black text-white">Assign Custom Badge</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Select a verification badge icon to display next to <span className="font-extrabold text-purple-400">{userToAssignBadge.displayName || userToAssignBadge.email}</span>'s username.
              </p>
            </div>

            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
              {badges.map((badge) => (
                <button
                  key={badge.id}
                  onClick={() => {
                    handleVerifyUser(userToAssignBadge.id, badge.id, badge.iconUrl);
                    setShowBadgeAssignModal(false);
                    setUserToAssignBadge(null);
                  }}
                  className="w-full text-left bg-[#030712] hover:bg-[#070c1b] border border-white/5 hover:border-purple-500/30 p-3.5 rounded-xl flex items-center gap-3 transition-all cursor-pointer group"
                >
                  <img src={badge.iconUrl} alt="" className="w-7 h-7 object-contain rounded-full bg-white/5 p-0.5 group-hover:scale-110 transition-transform shadow-[0_0_8px_rgba(139,92,246,0.3)]" />
                  <div>
                    <span className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors uppercase tracking-wider">{badge.name}</span>
                    <span className="block text-[8px] text-zinc-500 font-mono mt-0.5 uppercase">ID: {badge.id}</span>
                  </div>
                </button>
              ))}

              {badges.length === 0 && (
                <div className="text-center py-8 px-4 border border-dashed border-white/10 rounded-xl space-y-3">
                  <Sparkles className="w-6 h-6 text-zinc-500 mx-auto animate-pulse" />
                  <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">No custom badges published yet</p>
                  <p className="text-[10px] text-zinc-500">
                    Go to the <span className="font-extrabold text-zinc-400 font-mono text-[9px]">Badge Control</span> tab to design and publish custom vector images.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => { setShowBadgeAssignModal(false); setUserToAssignBadge(null); }}
                className="px-4 py-2 bg-zinc-900 border border-white/5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-bold cursor-pointer transition-colors uppercase tracking-wider"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            id={`toast-${t.id}`}
            className={`pointer-events-auto p-4 rounded-2xl shadow-2xl border flex items-center justify-between gap-3 text-xs font-semibold animate-fade-in ${
              t.type === 'success'
                ? 'bg-[#061c15]/90 border-emerald-500/30 text-emerald-300'
                : t.type === 'error'
                ? 'bg-[#1c0606]/90 border-rose-500/30 text-rose-300'
                : 'bg-zinc-900/90 border-white/10 text-zinc-200'
            }`}
          >
            <span>{t.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((toast) => toast.id !== t.id))}
              className="text-zinc-500 hover:text-white shrink-0 p-1 rounded-lg hover:bg-white/5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
