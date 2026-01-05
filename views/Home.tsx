import React from 'react';
import { Button } from '../components/Button';
import { Rocket, Target, CalendarCheck } from 'lucide-react';

interface HomeProps {
  onStart: () => void;
}

export const Home: React.FC<HomeProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 animate-pop">
      <div className="bg-white p-4 rounded-full shadow-xl mb-8">
        <Rocket className="w-16 h-16 text-emerald-500" />
      </div>
      
      <h1 className="text-4xl font-extrabold text-slate-800 mb-4 leading-tight">
        تحدي <span className="text-emerald-600">٢١ يوم</span>
        <br />
        لبناء عادات أفضل
      </h1>
      
      <p className="text-slate-500 text-lg mb-10 max-w-md">
        يقول العلماء أنك تحتاج إلى 21 يوماً لبناء عادة جديدة.
        هل أنت مستعد لتغيير حياتك للأفضل؟
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 w-full max-w-2xl">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center">
          <Target className="w-8 h-8 text-blue-500 mb-2" />
          <h3 className="font-bold text-slate-700">حدد هدفك</h3>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center">
          <CalendarCheck className="w-8 h-8 text-emerald-500 mb-2" />
          <h3 className="font-bold text-slate-700">التزم يومياً</h3>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center">
          <Rocket className="w-8 h-8 text-orange-500 mb-2" />
          <h3 className="font-bold text-slate-700">حقق النجاح</h3>
        </div>
      </div>

      <Button onClick={onStart} fullWidth className="max-w-xs text-xl py-4">
        ابدأ التحدي الآن
      </Button>
    </div>
  );
};
