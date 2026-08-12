import React, { useState } from 'react';
import { SupabaseService } from '../backend/supabase_service';
import { User, Lock, Mail, X, CheckCircle2, ShieldCheck, LogOut } from 'lucide-react';
import { UserSession } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: UserSession;
  setSession: React.Dispatch<React.SetStateAction<UserSession>>;
  initialMode?: 'signin' | 'signup';
  onAuthSuccess?: (userId: string) => void;
  onSignOut?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  session,
  setSession,
  initialMode = 'signin',
  onAuthSuccess,
  onSignOut,
}) => {
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [farmerName, setFarmerName] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setIsSignUp(initialMode === 'signup');
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        const { user, error } = await SupabaseService.signUp(email, password, farmerName || 'Farmer');
        if (error || !user) {
          throw new Error(error?.message || 'Failed to create account. Please try again.');
        }

        const userId = user.id;
        setSession({
          user: { id: userId, email: user.email || email, farmerName: user.farmerName || farmerName || 'Farmer' },
          isLoggedIn: true,
          isOffline: false,
          lastSyncedAt: new Date().toLocaleTimeString(),
        });
        setMessage({ type: 'success', text: 'Account created! Synced with Supabase.' });
        if (onAuthSuccess) onAuthSuccess(userId);
        setTimeout(() => onClose(), 600);
      } else {
        const { user, error } = await SupabaseService.signIn(email, password);
        if (error || !user) {
          throw new Error(error?.message || 'No account found or incorrect email/password. Please sign up or check your credentials.');
        }

        const userId = user.id;
        setSession({
          user: { id: userId, email: user.email || email, farmerName: user.farmerName || 'Farmer' },
          isLoggedIn: true,
          isOffline: false,
          lastSyncedAt: new Date().toLocaleTimeString(),
        });
        setMessage({ type: 'success', text: 'Logged in successfully!' });
        if (onAuthSuccess) onAuthSuccess(userId);
        setTimeout(() => onClose(), 600);
      }
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'No account found or incorrect email/password. Please sign up or check your credentials.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await SupabaseService.signOut();
    setSession({ user: null, isLoggedIn: false, isOffline: false, lastSyncedAt: new Date().toLocaleTimeString() });
    if (onSignOut) onSignOut();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2D302D]/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xs border border-[#EBE7DF] w-full max-w-md overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8C8F8C] hover:text-[#2D302D] p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-[#4A6741]" />
            <h2 className="text-2xl font-serif italic text-[#4A6741]">
              {session.isLoggedIn ? 'User Profile & Supabase Auth' : isSignUp ? 'Create Account' : 'Farmer Login'}
            </h2>
          </div>

          {session.isLoggedIn ? (
            <div className="space-y-4 pt-2">
              <div className="bg-[#F2F8F0] p-4 rounded-xl border border-[#4A6741]/20 space-y-2 text-xs">
                <div className="flex items-center space-x-2 text-[#4A6741] font-bold">
                  <CheckCircle2 className="w-4 h-4 text-[#4A6741]" />
                  <span>Authenticated Session Active</span>
                </div>
                <p className="text-[#2D302D]">Email: {session.user?.email}</p>
                <p className="text-[#2D302D]">Farmer: {session.user?.farmerName}</p>
                <p className="text-[#6B6E6B] text-[10px] font-mono">Supabase Row Level Security (RLS) Active</p>
              </div>

              <button
                onClick={handleSignOut}
                className="w-full bg-[#8B5E34] hover:bg-[#6B4727] text-white py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleAuth} className="space-y-4 pt-2">
              {message && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold ${
                    message.type === 'success' ? 'bg-[#F2F8F0] text-[#4A6741] border border-[#4A6741]/20' : 'bg-[#FDF9F3] text-[#8B5E34] border border-[#D4A373]/40'
                  }`}
                >
                  {message.text}
                </div>
              )}

              {isSignUp && (
                <div>
                  <label className="block text-xs font-bold text-[#2D302D] mb-1">Farmer Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#8C8F8C] absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="Ramesh Kumar"
                      value={farmerName}
                      onChange={(e) => setFarmerName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-[#D9D4C7] rounded-xl text-xs focus:ring-1 focus:ring-[#4A6741] focus:border-[#4A6741] focus:outline-none text-[#2D302D]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#2D302D] mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8C8F8C] absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="farmer@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-[#D9D4C7] rounded-xl text-xs focus:ring-1 focus:ring-[#4A6741] focus:border-[#4A6741] focus:outline-none text-[#2D302D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D302D] mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8C8F8C] absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-[#D9D4C7] rounded-xl text-xs focus:ring-1 focus:ring-[#4A6741] focus:border-[#4A6741] focus:outline-none text-[#2D302D]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#4A6741] hover:bg-[#3A5033] text-white py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
              >
                {loading ? 'Processing...' : isSignUp ? 'Create Supabase Account' : 'Sign In'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-xs text-[#4A6741] hover:text-[#3A5033] font-bold"
                >
                  {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
