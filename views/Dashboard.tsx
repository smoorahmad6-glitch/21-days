import React from 'react';
import { ChallengeData } from '../types';
import { TOTAL_DAYS, FALLBACK_QUOTES } from '../constants';
import { Button } from '../components/Button';
import { CheckCircle2, Circle, Lock, Share2, RefreshCw, PartyPopper, Sparkles } from 'lucide-react';

interface DashboardProps {
  data: ChallengeData;
  onUpdate: (newData: ChallengeData) => void;
  onRestart: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ data, onUpdate, onRestart }) => {
  // Calculate stats
  const completedCount = data.completedDays.length;
  const progress = Math.round((completedCount / TOTAL_DAYS) * 100);
  
  // Determine current day (next incomplete day)
  const currentDay = completedCount + 1;
  const isFinished = completedCount >= TOTAL_DAYS;

  // Get quote based on day index (rotates if days > quotes)
  const quote = FALLBACK_QUOTES[completedCount % FALLBACK_QUOTES.length];

  const handleCheckDay = (day: number) => {
    if (data.completedDays.includes(day)) return; // Already done
    
    // Only allow checking the current sequence day (or previous days if missed)
    // For flexibility, let's allow checking the immediate next day.
    if (day !== currentDay && day > currentDay) return;

    const newCompleted = [...data.completedDays, day].sort((a, b) => a - b);
    const isNowFinished = newCompleted.length >= TOTAL_DAYS;

    onUpdate({
      ...data,
      completedDays: newCompleted,
      isCompleted: isNowFinished,
      lastInteractionDate: new Date().toISOString()
    });
  };

  const shareProgress = () => {
    const text = `أنجزت ${completedCount} من 21 يوماً في تحدي "${data.habitName}"! 🚀\n#تحدي_21_يوم`;
    if (navigator.share) {
      navigator.share({
        title: 'تحدي 21 يوم',
        text: text,
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(text);
      alert('تم نسخ النص للمشاركة!');
    }
  };

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-10 animate-pop">
        <div className="mb-6 relative">
          <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-20 rounded-full"></div>
          <PartyPopper className="w-24 h-24 text-yellow-500 relative z-10" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-800 mb-2">ألف مبروك! 🎉</h2>
        <p className="text-xl text-slate-600 mb-8">
          لقد أتممت 21 يوماً من "{data.habitName}" بنجاح.
          <br/>
          أنت الآن شخص جديد!
        </p>

        <div className="bg-white p-8 rounded-2xl shadow-lg border-4 border-yellow-100 mb-8 w-full max-w-md transform rotate-1 hover:rotate-0 transition-transform">
          <div className="border-b-2 border-slate-100 pb-4 mb-4">
             <h3 className="text-emerald-600 font-bold tracking-wider text-sm uppercase">شهادة إنجاز</h3>
          </div>
          <p className="text-slate-800 font-bold text-2xl mb-2">{data.habitName}</p>
          <div className="text-slate-400 text-sm">اكتمل في {new Date().toLocaleDateString('ar-SA')}</div>
        </div>

        <div className="flex gap-4 w-full max-w-md">
          <Button onClick={shareProgress} variant="secondary" className="flex-1">
            مشاركة الإنجاز <Share2 className="w-4 h-4" />
          </Button>
          <Button onClick={onRestart} variant="outline" className="flex-1">
            تحدي جديد <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header Stats */}
      <div className="bg-emerald-600 text-white rounded-3xl p-6 mb-8 shadow-emerald-200 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="opacity-80 text-sm font-medium mb-1">التحدي الحالي</p>
              <h2 className="text-2xl font-bold">{data.habitName}</h2>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold">
              {progress}%
            </div>
          </div>
          
          <div className="mb-6">
            <div className="h-2 bg-emerald-900/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs mt-2 opacity-70">
              <span>البداية</span>
              <span>21 يوم</span>
            </div>
          </div>

          <div className="bg-emerald-700/50 rounded-xl p-4 border border-emerald-500/30 flex gap-3 items-start">
            <Sparkles className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-light leading-relaxed">
                "{quote.text}"
              </p>
            </div>
          </div>
        </div>
        
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white opacity-5 rounded-full"></div>
        <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-32 h-32 bg-white opacity-5 rounded-full"></div>
      </div>

      {/* Today's Action */}
      <div className="mb-10">
        <h3 className="text-slate-800 font-bold mb-4 flex items-center gap-2">
           <span className="bg-slate-100 text-slate-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">{currentDay}</span>
           مهمة اليوم
        </h3>
        
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="text-center sm:text-right">
             <p className="text-slate-500 text-sm mb-1">اليوم {currentDay} من 21</p>
             <p className="text-xl font-bold text-slate-800">هل أنجزت مهمتك اليوم؟</p>
          </div>
          <Button 
            onClick={() => handleCheckDay(currentDay)} 
            className="w-full sm:w-auto min-w-[160px] py-4 text-lg"
          >
            نعم، أنجزت! <CheckCircle2 className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div>
        <h3 className="text-slate-800 font-bold mb-4">خريطة الطريق</h3>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
          {Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).map((day) => {
            const isCompleted = data.completedDays.includes(day);
            const isCurrent = day === currentDay;
            const isLocked = day > currentDay;

            let bgClass = "bg-white border-slate-200 text-slate-400"; // Locked/Future
            if (isCompleted) bgClass = "bg-emerald-100 border-emerald-500 text-emerald-700";
            if (isCurrent && !isCompleted) bgClass = "bg-white border-emerald-500 text-emerald-600 ring-2 ring-emerald-100 ring-offset-2";

            return (
              <div 
                key={day}
                className={`
                  relative aspect-square rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-300
                  ${bgClass}
                  ${!isLocked && !isCompleted ? 'cursor-pointer hover:bg-slate-50' : ''}
                `}
                onClick={() => !isLocked && handleCheckDay(day)}
              >
                <span className="text-lg font-bold">{day}</span>
                <div className="mt-1">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 animate-pop" />
                  ) : isLocked ? (
                    <Lock className="w-4 h-4 opacity-30" />
                  ) : (
                    <Circle className="w-4 h-4 opacity-50" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="mt-12 text-center">
         <button onClick={onRestart} className="text-red-400 text-sm hover:text-red-600 underline">
            إلغاء التحدي والبدء من جديد
         </button>
      </div>
    </div>
  );
};