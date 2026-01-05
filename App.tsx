import React, { useEffect, useState } from 'react';
import { loadChallenge, saveChallenge, clearChallenge } from './services/storageService';
import { supabase } from './services/supabaseClient';
import { ChallengeData, ViewState } from './types';
import { Home } from './views/Home';
import { Selection } from './views/Selection';
import { Dashboard } from './views/Dashboard';
import { AuthModal } from './components/AuthModal';
import { UserCircle, LogOut, Cloud } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('HOME');
  const [data, setData] = useState<ChallengeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Initialize App
  useEffect(() => {
    // 1. Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      loadData();
    });

    // 2. Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      loadData(); // Reload data when auth changes (login/logout)
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const savedData = await loadChallenge();
    if (savedData) {
      setData(savedData);
      setView('DASHBOARD');
    } else {
      setData(null);
      setView('HOME');
    }
    setIsLoading(false);
  };

  // Save on updates
  useEffect(() => {
    if (data) {
      saveChallenge(data);
    }
  }, [data]);

  const startChallenge = (habitName: string) => {
    const newData: ChallengeData = {
      habitName,
      startDate: new Date().toISOString(),
      completedDays: [],
      isCompleted: false,
      lastInteractionDate: null,
    };
    setData(newData);
    setView('DASHBOARD');
  };

  const updateProgress = (newData: ChallengeData) => {
    setData(newData);
  };

  const restartChallenge = async () => {
    if (confirm('هل أنت متأكد من حذف التقدم والبدء من جديد؟')) {
      await clearChallenge();
      setData(null);
      setView('HOME');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Data will reload automatically due to onAuthStateChange
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-emerald-600 gap-4">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
        <p>جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-10">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-black text-xl text-emerald-600 flex items-center gap-2" onClick={() => setView(data ? 'DASHBOARD' : 'HOME')}>
            <span>21</span>
            <span className="text-slate-800">Challenges</span>
          </div>
          
          <div>
            {session ? (
              <div className="flex items-center gap-3">
                 <div className="hidden sm:flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    <Cloud className="w-3 h-3" />
                    <span>متصل</span>
                 </div>
                 <button 
                   onClick={handleLogout}
                   className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                   title="تسجيل الخروج"
                 >
                   <LogOut className="w-5 h-5" />
                 </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors"
              >
                <span>دخول</span>
                <UserCircle className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {view === 'HOME' && (
          <Home onStart={() => setView('SELECTION')} />
        )}
        
        {view === 'SELECTION' && (
          <Selection 
            onSelect={startChallenge} 
            onBack={() => setView('HOME')} 
          />
        )}

        {view === 'DASHBOARD' && data && (
          <Dashboard 
            data={data} 
            onUpdate={updateProgress}
            onRestart={restartChallenge}
          />
        )}
      </main>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* Footer */}
      <footer className="text-center text-slate-400 text-sm py-8">
        <p>صنع بحب للمثابرين 💪</p>
      </footer>
    </div>
  );
};

export default App;
