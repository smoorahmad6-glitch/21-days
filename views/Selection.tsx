import React, { useState } from 'react';
import { PRESET_HABITS } from '../constants';
import { Button } from '../components/Button';
import { Plus, ArrowRight } from 'lucide-react';

interface SelectionProps {
  onSelect: (habitName: string) => void;
  onBack: () => void;
}

export const Selection: React.FC<SelectionProps> = ({ onSelect, onBack }) => {
  const [customHabit, setCustomHabit] = useState('');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customHabit.trim()) {
      onSelect(customHabit.trim());
    }
  };

  return (
    <div className="animate-pop max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
          <ArrowRight className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-slate-800 mr-2">اختر التحدي</h2>
      </div>

      <p className="text-slate-500 mb-6">ما هي العادة التي تريد بناءها أو تركها خلال الـ 21 يوماً القادمة؟</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {PRESET_HABITS.map((habit) => (
          <button
            key={habit.id}
            onClick={() => onSelect(habit.name)}
            className="flex flex-col items-center justify-center p-4 bg-white border-2 border-transparent hover:border-emerald-500 rounded-2xl shadow-sm hover:shadow-md transition-all group"
          >
            <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">{habit.icon}</span>
            <span className="font-medium text-slate-700 text-center text-sm">{habit.name}</span>
          </button>
        ))}
      </div>

      <div className="border-t border-slate-200 pt-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-emerald-600" />
          تحدي خاص
        </h3>
        <form onSubmit={handleCustomSubmit} className="flex gap-2">
          <input
            type="text"
            value={customHabit}
            onChange={(e) => setCustomHabit(e.target.value)}
            placeholder="مثال: قراءة صفحة من القرآن..."
            className="flex-1 p-4 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
            required
          />
          <Button type="submit" disabled={!customHabit.trim()}>
            ابدأ
          </Button>
        </form>
      </div>
    </div>
  );
};
