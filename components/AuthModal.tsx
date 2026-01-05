import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Button } from './Button';
import { X, Mail, Loader2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) throw error;
      setMessage({ type: 'success', text: 'تم إرسال رابط الدخول إلى بريدك الإلكتروني!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'حدث خطأ أثناء تسجيل الدخول' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-pop">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute left-4 top-4 text-slate-400 hover:text-slate-600"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-slate-800 mb-2 text-center">حفظ التقدم</h2>
        <p className="text-slate-500 text-center mb-6 text-sm">
          سجل دخولك لحفظ بياناتك في السحابة والوصول إليها من أي جهاز.
        </p>

        {message && (
          <div className={`p-4 rounded-xl mb-4 text-sm font-medium ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">البريد الإلكتروني</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-left"
                dir="ltr"
              />
              <Mail className="w-5 h-5 text-slate-400 absolute right-3 top-3.5" />
            </div>
          </div>

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'إرسال رابط الدخول'}
          </Button>
        </form>
      </div>
    </div>
  );
};
