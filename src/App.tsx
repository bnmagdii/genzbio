import React, { useState, useEffect } from 'react';
import { 
  HashRouter, 
  Routes, 
  Route, 
  Navigate, 
  useNavigate, 
  useParams 
} from 'react-router-dom';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { logRbacDebug } from './lib/rbac';
import Auth from './components/Auth';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import Builder from './components/Builder';
import BioPage from './components/BioPage';
import AdminPanel from './components/AdminPanel';
import { WidgetsProvider } from './components/WidgetsContext';
import { RefreshCw, Sparkles, Lock } from 'lucide-react';

interface AdminMiddlewareProps {
  children: React.ReactNode;
  requiredRole: 'super_admin' | 'admin_or_higher';
  userRole: string | null;
  userRoles: string[];
}

function AdminMiddleware({ children, requiredRole, userRole, userRoles }: AdminMiddlewareProps) {
  const navigate = useNavigate();

  const hasSuperAdminPerm = userRole === 'super_admin' || userRoles.includes('super_admin');
  const hasAdminPerm = hasSuperAdminPerm || userRole === 'admin' || userRoles.includes('admin') || userRole === 'moderator' || userRoles.includes('moderator');

  let allowed = false;
  if (requiredRole === 'super_admin') {
    allowed = hasSuperAdminPerm;
  } else if (requiredRole === 'admin_or_higher') {
    allowed = hasAdminPerm;
  }

  if (!auth.currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!allowed) {
    // Show full-screen Access Denied card matching requested design
    const accessDeniedMessage = requiredRole === 'super_admin' 
      ? 'Access denied. Super Admin role required.' 
      : 'Access denied. Admin or Super Admin role required.';

    return (
      <div className="min-h-screen bg-[#06080F] flex items-center justify-center font-sans p-6 text-white text-center">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#090d16] border border-red-500/20 backdrop-blur-md shadow-2xl space-y-6">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20 text-rose-500">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-rose-400 uppercase tracking-wider">Access Restricted</h2>
            <p className="text-xs text-zinc-400 leading-relaxed font-semibold">
              {accessDeniedMessage}
            </p>
          </div>
          <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-2 text-[10px] text-zinc-500 font-mono text-left">
            <p>Current Account: <span className="text-zinc-350">{auth.currentUser.email}</span></p>
            <p>Role: <span className="text-purple-400 font-bold uppercase">{userRole || 'None'}</span></p>
            <p>Roles Array: <span>[{userRoles.join(', ')}]</span></p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full cursor-pointer py-3 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all border border-white/10"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Wrapper to bridge dynamic builder states
function BuilderWrapper() {
  const { bioId } = useParams<{ bioId: string }>();
  const navigate = useNavigate();

  if (!bioId) return <Navigate to="/dashboard" replace />;

  return (
    <Builder
      bioId={bioId}
      onBackToDashboard={() => navigate('/dashboard')}
      onViewDemo={(username) => window.open(`${window.location.origin}/#/${username}`, '_blank')}
    />
  );
}

// Wrapper to load dynamic username-slug routes
function DynamicBioWrapper() {
  return <BioPage />;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // STEP 3 - Auto Create User Document
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          
          let hasSuperAdmin = false;
          try {
            // Check roles database wide
            const saQuery = query(collection(db, 'users'), where('role', '==', 'super_admin'));
            const saSnap = await getDocs(saQuery);
            if (!saSnap.empty) {
              hasSuperAdmin = true;
            } else {
              const saQueryRoles = query(collection(db, 'users'), where('roles', 'array-contains', 'super_admin'));
              const saSnapRoles = await getDocs(saQueryRoles);
              if (!saSnapRoles.empty) {
                hasSuperAdmin = true;
              }
            }
          } catch (e) {
            console.warn("Could not query super_admin presence. Falling back.", e);
          }

          let loadedRole = 'user';
          let loadedRolesArray = ['user'];
          const isMegz = currentUser.email?.toLowerCase() === 'megzdocumentary@gmail.com';

          if (!hasSuperAdmin || isMegz) {
            loadedRole = 'super_admin';
            loadedRolesArray = ['super_admin'];
          }
          
          if (!userSnap.exists()) {
            const newDoc = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || '',
              photoURL: currentUser.photoURL || '',
              coverUrl: '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              verified: loadedRole === 'super_admin',
              verificationBadgeId: '',
              verificationIcon: '',
              role: loadedRole,
              roles: loadedRolesArray,
              banned: false
            };
            await setDoc(userRef, newDoc);
            console.log("Successfully auto-created and repaired user document for UID: ", currentUser.uid);
            setRole(loadedRole);
            setRoles(loadedRolesArray);
            
            logRbacDebug(currentUser.uid, loadedRole, loadedRolesArray);
          } else {
            const data = userSnap.data();
            let currentRole = data.role || 'user';
            let currentRolesArray = data.roles || (data.role ? [data.role] : ['user']);

            // Repair check: promote first registered user / megz to super_admin dynamically
            if (!hasSuperAdmin || (isMegz && currentRole !== 'super_admin')) {
              currentRole = 'super_admin';
              currentRolesArray = ['super_admin'];
              await setDoc(userRef, {
                role: 'super_admin',
                roles: ['super_admin'],
                verified: true,
                updatedAt: new Date().toISOString()
              }, { merge: true });
              console.log("Auto-promoted first user to super_admin!");
            } else if (!data.roles || data.roles.length === 0) {
              // Ensure roles array exists on existing users
              await setDoc(userRef, {
                roles: [currentRole]
              }, { merge: true });
              currentRolesArray = [currentRole];
            }

            setRole(currentRole);
            setRoles(currentRolesArray);

            logRbacDebug(currentUser.uid, currentRole, currentRolesArray);
          }
        } catch (error) {
          console.error("Firestore Permission or Fetch Error while checking/creating user doc: ", error);
        }
      } else {
        setRole(null);
        setRoles([]);
      }
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error: ', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06080F] flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-500 mx-auto" />
          <p className="text-xs text-zinc-400 font-bold tracking-widest uppercase">Assembling Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <WidgetsProvider>
      <HashRouter>
        <Routes>
          {/* Landing Page Route */}
          <Route 
            path="/" 
            element={
              <LandingPageContent 
                user={user} 
                onLogout={handleLogout} 
              />
            } 
          />

          {/* Auth Interfaces */}
          <Route 
            path="/auth" 
            element={
              user ? <Navigate to="/dashboard" replace /> : <AuthContent />
            } 
          />
          <Route 
            path="/login" 
            element={
              user ? <Navigate to="/dashboard" replace /> : <AuthContent />
            } 
          />

          {/* SaaS Dashboard Profile Control */}
          <Route 
            path="/dashboard" 
            element={
              user ? <DashboardContent onLogout={handleLogout} /> : <Navigate to="/login" replace />
            } 
          />

          {/* Secure Admin Dashboard Route and sub-pages */}
          <Route 
            path="/admin" 
            element={
              <AdminMiddleware requiredRole="admin_or_higher" userRole={role} userRoles={roles}>
                <AdminPanel defaultTab="dashboard" />
              </AdminMiddleware>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <AdminMiddleware requiredRole="admin_or_higher" userRole={role} userRoles={roles}>
                <AdminPanel defaultTab="users" />
              </AdminMiddleware>
            } 
          />
          <Route 
            path="/admin/settings" 
            element={
              <AdminMiddleware requiredRole="super_admin" userRole={role} userRoles={roles}>
                <AdminPanel defaultTab="settings" />
              </AdminMiddleware>
            } 
          />

          {/* Live Customizable Link Builder */}
          <Route 
            path="/builder/:bioId" 
            element={
              user ? <BuilderWrapper /> : <Navigate to="/login" replace />
            } 
          />

          {/* Dynamic Bio profile visitor view */}
          <Route path="/:username" element={<DynamicBioWrapper />} />

          {/* Fallback to index */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </WidgetsProvider>
  );
}

// Helpers content to isolate direct link switches inside Router scope
interface LandingProps {
  user: User | null;
  onLogout: () => void;
}

function LandingPageContent({ user, onLogout }: LandingProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative bg-[#030712]">
      {/* SaaS Upper Simple Navigation Bar */}
      <nav className="h-16 border-b border-white/[0.04] bg-[#030712]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2 select-none cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white font-black text-sm">
            G
          </div>
          <span className="font-black text-xs tracking-widest text-white uppercase">GEN-Z BIO</span>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <button
                onClick={() => navigate('/dashboard')}
                className="cursor-pointer bg-white/5 hover:bg-white/10 text-white font-bold text-xs py-2 px-4 rounded-xl transition-colors border border-white/10"
              >
                Go to Dashboard
              </button>
              <button
                onClick={onLogout}
                className="cursor-pointer text-xs font-bold text-zinc-400 hover:text-white"
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="cursor-pointer bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs py-2 px-5 rounded-xl transition-all shadow-md shadow-purple-600/10"
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      <LandingPage
        onStart={() => navigate(user ? '/dashboard' : '/login')}
        onViewDemo={(username) => navigate(`/${username}`)}
      />
    </div>
  );
}

function AuthContent() {
  const navigate = useNavigate();
  return <Auth onAuthSuccess={() => navigate('/dashboard')} />;
}

interface DashboardContentProps {
  onLogout: () => void;
}

function DashboardContent({ onLogout }: DashboardContentProps) {
  const navigate = useNavigate();
  return (
    <Dashboard
      onEditBio={(bioId) => navigate(`/builder/${bioId}`)}
      onLogout={onLogout}
      onViewDemo={(username) => window.open(`${window.location.origin}/#/${username}`, '_blank')}
    />
  );
}
