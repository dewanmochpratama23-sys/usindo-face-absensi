import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import Navbar from './components/Navbar';
import SystemFlowBanner from './components/SystemFlowBanner';
import StudentDashboard from './components/StudentDashboard';
import DailyAttendance from './components/DailyAttendance';
import StudentEnrollment from './components/StudentEnrollment';
import LecturerMonitoring from './components/LecturerMonitoring';
import LoginPage from './components/LoginPage';
import { ShieldCheck, ScanFace, Code, Server, Heart } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('usindo_active_tab') || 'dashboard');
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize Auth - Check for saved session or show LoginPage
  useEffect(() => {
    const init = async () => {
      const user = api.getUser();
      if (user && api.getToken()) {
        try {
          const freshUser = await api.getMe();
          setCurrentUser(freshUser);
        } catch {
          api.logout();
          setCurrentUser(null);
        }
      } else {
        // No saved user, user will log in personally via LoginPage
        setCurrentUser(null);
      }
      setIsInitializing(false);
    };
    init();
  }, []);

  // Handle Login with NIM & usindomaju01
  const handleLogin = async (identifier, password) => {
    const res = await api.login(identifier, password);
    setCurrentUser(res.user);
    setActiveTab(res.user.role === 'mahasiswa' ? 'dashboard' : 'monitoring');
  };

  // Handle Logout
  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
  };

  // Switch User (Quick Testing)
  const handleSwitchUser = async (identifier) => {
    try {
      const res = await api.login(identifier, 'usindomaju01');
      setCurrentUser(res.user);
    } catch (err) {
      alert('Gagal berganti akun: ' + err.message);
    }
  };

  // Switch Tab with Smooth Visual Feedback
  const handleSelectTab = (tab) => {
    setActiveTab(tab);
    localStorage.setItem('usindo_active_tab', tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center animate-bounce mb-3 shadow-lg shadow-blue-500/50">
          <ScanFace className="w-7 h-7" />
        </div>
        <p className="text-sm font-semibold tracking-wider text-slate-400">
          Memuat Sistem Absensi USINDO...
        </p>
      </div>
    );
  }

  // If no user is logged in, show dedicated LoginPage
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Main App Bar */}
      <Navbar
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={handleSelectTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Interactive System Flow Banner (Clickable Steps 1, 2, 3) */}
        <SystemFlowBanner
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
        />

        {/* View Switcher: Renders any selected module directly */}
        <div className="transition-opacity duration-200">
          {activeTab === 'enrollment' && (
            <StudentEnrollment
              currentUser={currentUser}
              onEnrollmentSuccess={(res) => {
                const userObj = res?.user || (res?.identifier ? res : null);
                if (userObj) {
                  setCurrentUser(userObj);
                }
              }}
            />
          )}

          {activeTab === 'absensi' && (
            <DailyAttendance
              currentUser={currentUser}
              onAttendanceSuccess={() => {
                // Keep on attendance or show success
              }}
            />
          )}

          {activeTab === 'dashboard' && (
            <StudentDashboard
              currentUser={currentUser}
              onNavigate={tab => handleSelectTab(tab)}
            />
          )}

          {(activeTab === 'monitoring' || activeTab === 'audit') && (
            <LecturerMonitoring currentUser={currentUser} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <ScanFace className="w-4 h-4 text-blue-500" />
            <span className="font-semibold text-slate-300">
              Sistem Absensi Biometrik Wajah USINDO
            </span>
            <span>•</span>
            <span>USINDO (Universitas Sehati Indonesia)</span>
          </div>

          <div className="flex items-center space-x-4 font-mono text-[11px] text-slate-400">
            <span>React + Vite</span>
            <span>•</span>
            <span>Node.js REST API</span>
            <span>•</span>
            <span>128-d Vector Cosine Match</span>
            <span>•</span>
            <span>Geofencing & Liveness</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
