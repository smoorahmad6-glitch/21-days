import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Button } from './Button';
import { X, Mail, Loader2, Cloud, CheckCircle2, Lock, Eye, EyeOff, KeyRound, ArrowRight, AlertCircle, RefreshCw, HelpCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [step, setStep] = useState<'form' | 'verify'>('form'); // form = email/pass, verify = otp code
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);

  if (!isOpen) return null;

  // 1. Handle Initial Submit (Login or Signup)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onClose();
      } else {
        // Signup Flow
        // This triggers the "Confirm Your Email" template in Supabase.
        // You MUST change that template in Supabase Dashboard to send {{ .Token }} instead of a link.
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) throw error;
        
        if (data.user && !data.session) {
          setStep('verify');
          setMessage({ 
            type: 'info', 
            text: 'تم إرسال رمز التفعيل إلى بريدك الإلكتروني.' 
          });
        } else if (data.session) {
          onClose(); // Auto logged in (if email confirmation is disabled)
        }
      }
    } catch (error: any) {
      handleErrors(error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle OTP Verification
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // For new signups, we verify the 'signup' token.
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'signup', // Explicitly verify signup code
      });

      if (error) {
        // Fallback: If user clicked "Resend" generically, it might be an 'email' (magic link) code
        const fallback = await supabase.auth.verifyOtp({
          email,
          token: otp,
          type: 'email',
        });
        
        if (fallback.error) throw error; // Throw original error if fallback also fails
        
        if (fallback.data.session) {
           finishLogin();
           return;
        }
      }

      if (data?.session) {
        finishLogin();
      } else {
        // Sometimes user is verified but not logged in automatically
        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError) throw loginError;
        finishLogin();
      }
    } catch (error: any) {
      console.error(error);
      setMessage({ type: 'error', text: 'الرمز غير صحيح أو منتهي الصلاحية' });
    } finally {
      setLoading(false);
    }
  };

  const finishLogin = () => {
    setMessage({ type: 'success', text: 'تم تفعيل الحساب بنجاح!' });
    setTimeout(() => onClose(), 1000);
  };

  const handleResendCode = async () => {
    setLoading(true);
    setMessage(null);
    try {
      // Resend the signup confirmation email
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      
      if (error) throw error;
      setMessage({ type: 'success', text: 'تم إعادة إرسال رمز التفعيل' });
    } catch (error: any) {
      // Fallback: try sending a generic OTP if signup resend isn't allowed
      try {
        await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false }});
        setMessage({ type: 'success', text: 'تم إرسال رمز جديد' });
      } catch (e) {
        setMessage({ type: 'error', text: 'يرجى الانتظار دقيقة قبل المحاولة مرة أخرى' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleErrors = (error: any) => {
    let errorMsg = 'حدث خطأ غير متوقع';
    if (error.message.includes('Invalid login credentials')) errorMsg = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
    else if (error.message.includes('User already registered')) errorMsg = 'هذا البريد مسجل مسبقاً، حاول تسجيل الدخول';
    else if (error.message.includes('Password')) errorMsg = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    else if (error.message.includes('security purposes')) errorMsg = 'يرجى الانتظار دقيقة قبل المحاولة مرة أخرى';
    else errorMsg = error.message;
    setMessage({ type: 'error', text: errorMsg });
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });
      if (error) throw error;
    } catch (error: any) {
      setMessage({ type: 'error', text: 'حدث خطأ في الاتصال مع Google' });
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setStep('form');
    setMessage(null);
    setOtp('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-pop">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden">
        {/* Header Background */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-emerald-50 to-emerald-100 z-0"></div>
        
        <button 
          onClick={onClose}
          className="absolute left-4 top-4 text-slate-400 hover:text-slate-600 z-10 bg-white/50 p-1 rounded-full backdrop-blur-md"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="relative z-10 flex flex-col items-center mt-8">
          <div className="bg-white p-3 rounded-2xl shadow-lg mb-4">
             <Cloud className="w-10 h-10 text-emerald-500" />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-800 mb-2 text-center">
            {step === 'verify' ? 'تأكيد الحساب' : (mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد')}
          </h2>
          <p className="text-slate-500 text-center mb-6 text-sm max-w-xs leading-relaxed">
            {step === 'verify' 
              ? `أدخل رمز التفعيل الذي تم إرساله إلى ${email}`
              : (mode === 'login' ? 'مرحباً بعودتك! أكمل رحلة التحدي.' : 'سجل بريدك وكلمة المرور للبدء.')}
          </p>
        </div>

        {message && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-medium flex items-start gap-2 ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 
            message.type === 'info' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
            'bg-red-50 text-red-700 border border-red-100'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 mt-0.5 min-w-[20px]" /> : 
             message.type === 'info' ? <HelpCircle className="w-5 h-5 mt-0.5 min-w-[20px]" /> :
             <AlertCircle className="w-5 h-5 mt-0.5 min-w-[20px]" />}
            <span>{message.text}</span>
          </div>
        )}

        <div className="space-y-4">
          {step === 'form' ? (
            /* --- EMAIL & PASSWORD FORM --- */
            <>
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 py-3.5 rounded-xl font-medium transition-all shadow-sm active:scale-95"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <span>Google</span>
                  </>
                )}
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 text-xs">أو باستخدام البريد</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="البريد الإلكتروني"
                      dir="ltr"
                      className="w-full pl-4 pr-10 py-3.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-left placeholder:text-slate-400"
                    />
                    <Mail className="w-5 h-5 text-slate-400 absolute right-3 top-4" />
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="كلمة المرور"
                      dir="ltr"
                      className="w-full pl-10 pr-10 py-3.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-left placeholder:text-slate-400"
                    />
                    <Lock className="w-5 h-5 text-slate-400 absolute right-3 top-4" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-4 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" fullWidth disabled={loading}>
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (mode === 'login' ? 'دخول' : 'إنشاء حساب')}
                </Button>
              </form>

              <div className="text-center mt-4">
                <button
                  onClick={() => {
                    setMode(mode === 'login' ? 'signup' : 'login');
                    setMessage(null);
                    setPassword('');
                  }}
                  className="text-sm text-slate-500 hover:text-emerald-600 font-medium transition-colors"
                >
                  {mode === 'login' 
                    ? 'ليس لديك حساب؟ أنشئ حساباً جديداً' 
                    : 'لديك حساب بالفعل؟ تسجيل الدخول'}
                </button>
              </div>
            </>
          ) : (
            /* --- OTP VERIFICATION FORM --- */
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="******"
                  className="w-full pl-4 pr-10 py-3.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-center text-2xl tracking-widest font-mono text-slate-700"
                  dir="ltr"
                  maxLength={6}
                />
                <KeyRound className="w-5 h-5 text-slate-400 absolute right-3 top-4" />
              </div>

              <div className="text-xs text-slate-500 text-center px-4 leading-relaxed">
                 تأكد من إدخال الكود المكون من 6 أرقام.
              </div>

              <Button type="submit" fullWidth disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'تفعيل الحساب'}
              </Button>

              <div className="flex flex-col items-center gap-2 mt-4">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={loading}
                  className="flex items-center gap-1 text-sm text-slate-500 hover:text-emerald-600 transition-colors"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                  <span>لم يصلك الكود؟ إعادة الإرسال</span>
                </button>
                
                <button
                  type="button"
                  onClick={resetFlow}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
                >
                  <ArrowRight className="w-3 h-3" />
                  <span>العودة للتسجيل</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};