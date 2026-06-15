"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { dbService } from "@/config/dbService";
import { UserDoc, VerificationBadge, VerificationLog } from "@/types";
import {
  ShieldAlert,
  Users,
  CheckCircle,
  FileText,
  Plus,
  Trash2,
  UserCheck,
  Ban,
  ShieldAlert as ShieldIcon,
  ArrowLeft,
  Loader2,
  FileCode,
  Award,
  Calendar,
  Lock,
  Upload
} from "lucide-react";
import confetti from "canvas-confetti";

export default function AdminPanelPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"users" | "verification" | "badges" | "logs">("users");
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");

  // Data collections state
  const [allUsers, setAllUsers] = useState<UserDoc[]>([]);
  const [badges, setBadges] = useState<VerificationBadge[]>([]);
  const [auditLogs, setAuditLogs] = useState<VerificationLog[]>([]);

  // Badge creator form states
  const [newBadgeId, setNewBadgeId] = useState("");
  const [newBadgeName, setNewBadgeName] = useState("");
  const [newBadgeIcon, setNewBadgeIcon] = useState(""); // base64 or emoji
  const [uploadingBadge, setUploadingBadge] = useState(false);

  // Verification assignment states
  const [selectedUserUid, setSelectedUserUid] = useState("");
  const [selectedBadgeId, setSelectedBadgeId] = useState("");

  // Guard routing
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      const hasPrivilege = user.role === "admin" || user.role === "super_admin" || user.role === "moderator";
      if (!hasPrivilege) {
        setError("Access Denied: You do not possess Space Command credentials.");
        setLoadingData(false);
      } else {
        loadAdminData();
      }
    }
  }, [user, authLoading, router]);

  const loadAdminData = async () => {
    setLoadingData(true);
    try {
      const usersList = await dbService.getAllUsers();
      const badgesList = await dbService.getBadges();
      const logsList = await dbService.getLogs();

      setAllUsers(usersList);
      setBadges(badgesList);
      setAuditLogs(logsList);

      if (usersList.length > 0) {
        setSelectedUserUid(usersList[0].uid);
      }
      if (badgesList.length > 0) {
        setSelectedBadgeId(badgesList[0].id);
      }
    } catch (e) {
      console.error(e);
      setError("Failed to query satellite records.");
    } finally {
      setLoadingData(false);
    }
  };

  // Manage Role promote/demote
  const handleUpdateRole = async (targetUid: string, newRole: any) => {
    if (!user) return;
    
    // Only super_admin can promote/demote to admin/super_admin roles!
    const targetUser = allUsers.find((u) => u.uid === targetUid);
    if (!targetUser) return;

    if (newRole === "admin" || newRole === "super_admin" || targetUser.role === "admin" || targetUser.role === "super_admin") {
      if (user.role !== "super_admin") {
        alert("Operation Aborted: Only the Super Admin can alter high-tier credentials.");
        return;
      }
    }

    try {
      await dbService.updateUser(targetUid, {
        role: newRole,
        roles: ["user", newRole]
      });

      // Write Log
      const newLog: VerificationLog = {
        id: `log-${Math.random().toString(36).substring(2, 9)}`,
        adminId: user.uid,
        adminEmail: user.email,
        targetUserId: targetUid,
        targetUsername: targetUser.username || "N/A",
        action: "promote_role",
        details: `Updated role to ${newRole}`,
        timestamp: new Date().toISOString()
      };
      await dbService.addLog(newLog);

      alert(`User role adjusted to ${newRole} successfully.`);
      loadAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  // Ban/Unban Users
  const handleToggleBan = async (targetUid: string, banState: boolean) => {
    if (!user || targetUid === user.uid) {
      alert("Error: You cannot decommission your own command pod.");
      return;
    }

    const targetUser = allUsers.find((u) => u.uid === targetUid);
    if (!targetUser) return;

    if (targetUser.role === "super_admin") {
      alert("Unauthorized: The Super Admin cannot be banned.");
      return;
    }

    try {
      await dbService.updateUser(targetUid, { banned: banState });

      // Log action
      const newLog: VerificationLog = {
        id: `log-${Math.random().toString(36).substring(2, 9)}`,
        adminId: user.uid,
        adminEmail: user.email,
        targetUserId: targetUid,
        targetUsername: targetUser.username || "N/A",
        action: banState ? "ban_user" : "unban_user",
        details: banState ? "Banned account" : "Restored account",
        timestamp: new Date().toISOString()
      };
      await dbService.addLog(newLog);

      alert(`User ban status updated.`);
      loadAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  // Assign Verification Badge
  const handleAssignVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedUserUid) return;

    const targetUser = allUsers.find((u) => u.uid === selectedUserUid);
    const badge = badges.find((b) => b.id === selectedBadgeId);
    if (!targetUser || !badge) return;

    try {
      await dbService.updateUser(selectedUserUid, {
        verified: true,
        verificationBadgeId: badge.id,
        verificationIcon: badge.iconURL, // Emoji or base64 icon
        verifiedBy: user.email,
        verifiedAt: new Date().toISOString()
      });

      // Write Log
      const newLog: VerificationLog = {
        id: `log-${Math.random().toString(36).substring(2, 9)}`,
        adminId: user.uid,
        adminEmail: user.email,
        targetUserId: selectedUserUid,
        targetUsername: targetUser.username || "N/A",
        action: "verify",
        badgeId: badge.id,
        details: `Assigned verification badge: ${badge.badgeName}`,
        timestamp: new Date().toISOString()
      };
      await dbService.addLog(newLog);

      confetti({
        particleCount: 80,
        spread: 50,
        colors: ["#22D3EE", "#7C3AED"]
      });

      alert(`Verification credentials dispatched to user.`);
      loadAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  // Revoke Verification
  const handleRevokeVerification = async (targetUid: string) => {
    if (!user) return;
    const targetUser = allUsers.find((u) => u.uid === targetUid);
    if (!targetUser) return;

    try {
      await dbService.updateUser(targetUid, {
        verified: false,
        verificationBadgeId: "",
        verificationIcon: "",
        verifiedBy: "",
        verifiedAt: null
      });

      // Write Log
      const newLog: VerificationLog = {
        id: `log-${Math.random().toString(36).substring(2, 9)}`,
        adminId: user.uid,
        adminEmail: user.email,
        targetUserId: targetUid,
        targetUsername: targetUser.username || "N/A",
        action: "unverify",
        details: `Revoked verification credentials`,
        timestamp: new Date().toISOString()
      };
      await dbService.addLog(newLog);

      alert(`Verification credentials revoked.`);
      loadAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  // Create verification badge (accepts base64 base uploads)
  const handleUploadBadgeImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/png", "image/svg+xml", "image/x-icon", "image/webp"];
    if (!allowed.includes(file.type)) {
      alert("Invalid format. Upload only PNG, SVG, ICO, or WEBP badges.");
      return;
    }

    setUploadingBadge(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewBadgeIcon(reader.result as string);
      setUploadingBadge(false);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBadgeId.trim() || !newBadgeName.trim() || !newBadgeIcon) {
      alert("Please configure a valid ID, title, and badge graphics file.");
      return;
    }

    try {
      const newBadge: VerificationBadge = {
        id: newBadgeId.toLowerCase().trim().replace(/\s+/g, ""),
        badgeName: newBadgeName,
        iconURL: newBadgeIcon,
        createdAt: new Date().toISOString()
      };

      await dbService.addBadge(newBadge);
      alert("Galactic verification badge registered successfully.");
      
      setNewBadgeId("");
      setNewBadgeName("");
      setNewBadgeIcon("");
      loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  if (authLoading || loadingData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-bg-space">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="mt-4 text-xs font-orbitron tracking-widest text-cyan-400">
          DECRYPTING COMMAND CONSOLE RECORDS...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-bg-space p-6 text-center">
        <ShieldAlert className="w-12 h-12 text-red-500 animate-bounce" />
        <h3 className="text-lg font-orbitron font-bold text-white mt-4 uppercase">COMMAND BLOCK OVERRIDE</h3>
        <p className="text-xs text-gray-400 mt-2">{error}</p>
        <Link href="/dashboard" className="mt-6 px-4 py-2 bg-purple-950 border border-purple-500/30 text-xs rounded-lg hover:bg-purple-900 transition-colors">
          Abort to Shuttle Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-bg-space relative">
      
      {/* Top Header Comm bar */}
      <header className="w-full border-b border-purple-900/40 bg-slate-950/85 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2 rounded-lg bg-slate-900 border border-purple-950 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="text-left flex items-center gap-2">
            <ShieldIcon className="w-5 h-5 text-purple-400 animate-pulse" />
            <div>
              <h1 className="text-sm font-bold font-orbitron text-white">SPACE COMMAND HUB</h1>
              <span className="text-[10px] text-cyan-400 font-mono tracking-wide uppercase">
                CREDENTIALS: {user?.role.replace("_", " ")} SECURITY GATE
              </span>
            </div>
          </div>
        </div>

        <div className="text-xs font-mono px-3 py-1 bg-purple-950/50 border border-purple-900/40 text-purple-300 rounded-md">
          {allUsers.length} active cores logged
        </div>
      </header>

      {/* Control console Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col lg:flex-row gap-6">
        
        {/* Left Side: Navigation tabs HUD list */}
        <div className="w-full lg:w-1/4 flex flex-col gap-2.5">
          <h3 className="text-[10px] uppercase font-orbitron font-bold text-purple-300 tracking-wider text-left pl-2">
            CONSOLE PATHWAYS
          </h3>
          {[
            { id: "users", label: "User Directory", icon: Users },
            { id: "verification", label: "Verification Hub", icon: UserCheck },
            { id: "badges", label: "Badges Registry", icon: Award },
            { id: "logs", label: "Audit Signals Log", icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-4 rounded-xl text-xs font-orbitron font-bold tracking-wider flex items-center gap-3 border text-left cursor-pointer transition-all ${
                  activeTab === tab.id
                    ? "bg-primary border-purple-400/50 text-white shadow-lg shadow-primary/20"
                    : "bg-slate-950/80 border-purple-950 text-gray-400 hover:text-white"
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right Side: Tab Panel Content (width 75%) */}
        <div className="flex-1 w-full glass-panel p-6 border-purple-500/20 bg-slate-950/30 overflow-x-auto min-h-[60vh] flex flex-col gap-6 text-left">
          
          {/* TAB 1: USERS DIRECTORY */}
          {activeTab === "users" && (
            <div className="flex flex-col gap-4">
              <h3 className="text-base font-bold font-orbitron text-white">Registered Space User Directory</h3>
              <p className="text-xs text-gray-400">Audit system accounts, toggle permissions, promote roles, or ban coordinates.</p>

              <div className="w-full overflow-x-auto mt-2">
                <table className="w-full border-collapse text-xs text-left">
                  <thead>
                    <tr className="border-b border-purple-900/40 text-gray-500 font-mono">
                      <th className="py-2.5 px-3">Display Name</th>
                      <th className="py-2.5 px-3">Core Tag</th>
                      <th className="py-2.5 px-3">Vocation/Role</th>
                      <th className="py-2.5 px-3">State</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((u) => (
                      <tr key={u.uid} className="border-b border-purple-950 hover:bg-purple-950/10 transition-colors">
                        <td className="py-3 px-3 flex items-center gap-2">
                          <img src={u.photoURL} className="w-7 h-7 rounded-full border border-purple-500/20" />
                          <span className="font-bold text-gray-200">{u.displayName}</span>
                        </td>
                        <td className="py-3 px-3 font-mono text-cyan-400 font-semibold">{u.username || "unset"}</td>
                        <td className="py-3 px-3">
                          {user?.role === "super_admin" ? (
                            <select
                              value={u.role}
                              onChange={(e) => handleUpdateRole(u.uid, e.target.value)}
                              className="p-1 bg-slate-950 border border-purple-950 rounded text-purple-300 font-semibold"
                            >
                              <option value="user">User</option>
                              <option value="moderator">Moderator</option>
                              <option value="admin">Admin</option>
                              <option value="super_admin">Super Admin</option>
                            </select>
                          ) : (
                            <span className="px-2 py-0.5 bg-slate-900 border border-purple-950 rounded text-gray-400">
                              {u.role.toUpperCase()}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          {u.banned ? (
                            <span className="px-2 py-0.5 bg-red-950/40 border border-red-500/30 text-red-400 rounded-full font-mono text-[9px]">BANNED</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-green-950/40 border border-green-500/30 text-green-400 rounded-full font-mono text-[9px]">ACTIVE</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleToggleBan(u.uid, !u.banned)}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              u.banned
                                ? "bg-green-950/20 border-green-500/20 text-green-400 hover:bg-green-950"
                                : "bg-red-950/20 border-red-500/20 text-red-400 hover:bg-red-950"
                            }`}
                            title={u.banned ? "Restore user access" : "Ban user coordinates"}
                            disabled={u.uid === user?.uid || u.role === "super_admin"}
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: VERIFICATION PORTAL */}
          {activeTab === "verification" && (
            <div className="flex flex-col gap-5">
              <h3 className="text-base font-bold font-orbitron text-white">Profile Verification Console</h3>
              <p className="text-xs text-gray-400">Manually issue verification badges to orbiting user profiles. Users cannot assign verification to themselves.</p>

              {/* Assign form */}
              <form onSubmit={handleAssignVerification} className="glass-panel p-5 border-purple-500/20 bg-slate-950/80 flex flex-col gap-4 mt-2">
                <h4 className="text-xs uppercase font-bold text-cyan-400 font-orbitron">Issue Verification Credentials</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-purple-300 font-bold uppercase">Select Core Target</label>
                    <select
                      value={selectedUserUid}
                      onChange={(e) => setSelectedUserUid(e.target.value)}
                      className="p-2.5 bg-slate-950 border border-purple-900/50 rounded-xl text-xs text-white"
                    >
                      {allUsers.map((u) => (
                        <option key={u.uid} value={u.uid}>
                          {u.displayName} ({u.username ? `@${u.username}` : u.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-purple-300 font-bold uppercase">Choose Badge Design</label>
                    <select
                      value={selectedBadgeId}
                      onChange={(e) => setSelectedBadgeId(e.target.value)}
                      className="p-2.5 bg-slate-950 border border-purple-900/50 rounded-xl text-xs text-white"
                    >
                      {badges.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.badgeName} ({b.iconURL})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-primary to-accent hover:from-cyan-500 hover:to-primary text-xs font-orbitron font-bold text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-primary/20"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>DISPATCH VERIFICATION SIGIL</span>
                </button>
              </form>

              {/* Verified Users list */}
              <div className="flex flex-col gap-3 mt-4">
                <h4 className="text-xs uppercase font-orbitron font-bold text-purple-300">VERIFIED USER REPOSITORIES</h4>
                <div className="flex flex-col gap-2">
                  {allUsers.filter((u) => u.verified).length === 0 ? (
                    <p className="text-xs text-gray-500 italic">No verified accounts currently logged in database.</p>
                  ) : (
                    allUsers
                      .filter((u) => u.verified)
                      .map((u) => (
                        <div
                          key={u.uid}
                          className="glass-panel p-3.5 bg-slate-950/60 border border-purple-950 flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3">
                            <img src={u.photoURL} className="w-9 h-9 rounded-full" />
                            <div className="text-left">
                              <h5 className="text-xs font-bold text-white flex items-center gap-1">
                                {u.displayName}
                                <span>{u.verificationIcon}</span>
                              </h5>
                              <span className="text-[9px] text-gray-400 block font-mono">
                                Verified by: {u.verifiedBy} at {u.verifiedAt ? new Date(u.verifiedAt).toLocaleDateString() : ""}
                              </span>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleRevokeVerification(u.uid)}
                            className="px-3 py-1.5 rounded-lg bg-red-950/20 hover:bg-red-950/60 border border-red-500/30 text-[10px] font-bold text-red-400 hover:text-white transition-all cursor-pointer"
                          >
                            REVOKE CREDENTIALS
                          </button>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOM BADGES */}
          {activeTab === "badges" && (
            <div className="flex flex-col gap-5">
              <h3 className="text-base font-bold font-orbitron text-white">Galactic Verification Badges Registry</h3>
              <p className="text-xs text-gray-400">Design, upload, and register custom verification badge icons (supports PNG, SVG, ICO, WEBP formats).</p>

              {/* Upload Form */}
              <form onSubmit={handleCreateBadge} className="glass-panel p-5 border-purple-500/20 bg-slate-950/80 flex flex-col gap-4 mt-2">
                <h4 className="text-xs uppercase font-bold text-cyan-400 font-orbitron">Upload custom badge</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-purple-300 font-bold uppercase">Badge Unique ID</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. game-champ"
                      value={newBadgeId}
                      onChange={(e) => setNewBadgeId(e.target.value)}
                      className="px-3 py-2 bg-slate-950 border border-purple-900/50 rounded-xl text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-purple-300 font-bold uppercase">Badge Title Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Arena Champion"
                      value={newBadgeName}
                      onChange={(e) => setNewBadgeName(e.target.value)}
                      className="px-3 py-2 bg-slate-950 border border-purple-900/50 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 border border-dashed border-purple-900/50 p-4 rounded-xl">
                  <div className="flex-1 text-left flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-purple-300">Vector Graphic File</span>
                    <span className="text-[9px] text-gray-500">Attach PNG, SVG, ICO or WEBP badge assets.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="px-4 py-2 bg-slate-900 hover:bg-slate-950 border border-purple-950 text-xs font-semibold text-gray-300 rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingBadge ? "Loading file..." : "Choose File"}</span>
                      <input
                        type="file"
                        accept=".png,.svg,.ico,.webp"
                        className="hidden"
                        onChange={handleUploadBadgeImage}
                      />
                    </label>
                    
                    {/* Render uploaded badge thumbnail */}
                    {newBadgeIcon && (
                      <div className="w-10 h-10 rounded border border-cyan-400/30 bg-slate-950 flex items-center justify-center text-lg">
                        {newBadgeIcon.startsWith("data:") ? (
                          <img src={newBadgeIcon} className="w-8 h-8 object-contain" />
                        ) : (
                          <span>{newBadgeIcon}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-xs font-orbitron font-bold text-white transition-all hover:scale-102 cursor-pointer shadow-lg shadow-primary/20"
                >
                  Save Badge to Database
                </button>
              </form>

              {/* Listed Badges */}
              <div className="flex flex-col gap-3 mt-4">
                <h4 className="text-xs uppercase font-orbitron font-bold text-purple-300">REGISTERED BADGES ({badges.length})</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {badges.map((b) => (
                    <div
                      key={b.id}
                      className="glass-panel p-4 bg-slate-950/50 border-purple-950 flex flex-col items-center justify-between gap-3 text-center"
                    >
                      <div className="w-12 h-12 rounded bg-slate-950 border border-white/5 flex items-center justify-center text-xl">
                        {b.iconURL.startsWith("data:") ? (
                          <img src={b.iconURL} className="w-9 h-9 object-contain" />
                        ) : (
                          <span>{b.iconURL}</span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-200">{b.badgeName}</span>
                        <span className="text-[9px] font-mono text-cyan-400 mt-0.5">{b.id}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AUDIT LOGS */}
          {activeTab === "logs" && (
            <div className="flex flex-col gap-4">
              <h3 className="text-base font-bold font-orbitron text-white">Galactic Audit Activity Log</h3>
              <p className="text-xs text-gray-400">Verify permission upgrades, verification logs, and account suspensions.</p>

              <div className="flex flex-col gap-3.5 mt-2">
                {auditLogs.length === 0 ? (
                  <p className="text-xs text-gray-500 italic text-center py-10">No log entries currently recorded in audit bank.</p>
                ) : (
                  auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="glass-panel p-4 bg-slate-950/60 border border-purple-950 flex items-start gap-4"
                    >
                      <div className="p-2 rounded-xl bg-purple-900/30 border border-purple-800/40 text-purple-400">
                        <FileCode className="w-4.5 h-4.5" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-200 font-mono">{log.action.toUpperCase()}</span>
                          <span className="text-[9px] text-gray-500 font-mono flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Admin <span className="text-white font-semibold">{log.adminEmail}</span>: {log.details} on profile link @<span className="text-cyan-400 font-bold font-mono">{log.targetUsername}</span>
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
