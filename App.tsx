import React, { useEffect, useState } from 'react';
import { loadChallenge, saveChallenge, clearChallenge } from './services/storageService';
import { ChallengeData, ViewState } from './types';
import { Home } from './views/Home';
import { Selection } from './views/Selection';
import { Dashboard } from './views/Dashboard';
import { Layout } from 'lucide-react'; // Accidentally imported Icon instead of component, fixing below in return

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('HOME');
  const [data, setData] = useState<ChallengeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial state
  useEffect(() => {
    const savedData = loadChallenge();
    if (savedData) {
      setData(savedData);
      setView('DASHBOARD');
    }
    setIsLoading(false);
  }, []);

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

  const restartChallenge = () => {
    if (confirm('هل أنت متأكد من حذف التقدم والبدء من جديد؟')) {
      clearChallenge();
      setData(null);
      setView('HOME');
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-emerald-600">جاري التحميل...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-10">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-black text-xl text-emerald-600 flex items-center gap-2">
            <span>21</span>
            <span className="text-slate-800">Challenges</span>
          </div>
          {/* Simple placeholder for future settings/dark mode toggle */}
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

      {/* Footer */}
      <footer className="text-center text-slate-400 text-sm py-8">
        <p>صنع بحب للمثابرين 💪</p>
      </footer>
    </div>
  );
};

export default App;
