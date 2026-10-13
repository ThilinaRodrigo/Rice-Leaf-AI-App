import React, { useState } from 'react';
import { ShieldCheck, RefreshCw, KeyRound, X, Lock, Eye, EyeOff, Menu } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useMobileNav } from '../context/NavigationContext';
import { changePassword } from '../api/adminApi';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, onRefresh }) => {
  const { user } = useAdminAuth();
  const { toggleMobile } = useMobileNav();

  const [showModal, setShowModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMsg('Please fill in all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setSuccessMsg('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setShowModal(false);
        setSuccessMsg('');
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || err.message || 'Failed updating password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between gap-3">
        {/* Left: Mobile hamburger + Page Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={toggleMobile}
            className="p-2 rounded-xl border border-slate-800 bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800 lg:hidden shrink-0 transition-colors cursor-pointer"
            title="Open navigation menu"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5 text-emerald-400" />
          </button>

          <div className="min-w-0">
            <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight truncate">
              {title}
            </h2>
            {subtitle && (
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 truncate hidden xs:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 sm:p-2.5 rounded-xl border border-slate-800 bg-slate-800/50 text-slate-300 hover:text-white hover:bg-slate-800 transition-all duration-200 cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setShowModal(true)}
            className="p-2 sm:px-3 sm:py-2.5 rounded-xl border border-slate-800 bg-slate-800/50 text-slate-300 hover:text-white hover:bg-slate-800 transition-all duration-200 flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            title="Change Password"
          >
            <KeyRound className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">Change Password</span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden md:inline">SysAdmin Active</span>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden sm:block mx-0.5" />

          <div className="flex items-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 text-xs sm:text-sm shrink-0">
              {user?.full_name?.charAt(0) || 'A'}
            </div>
          </div>
        </div>
      </header>

      {/* Change Password Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-slate-800 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-extrabold text-white mb-1 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-emerald-400" />
              <span>Change Password</span>
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Update your account credentials for security compliance.
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-semibold">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs text-center font-semibold">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Current Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 pl-10 pr-10 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 text-slate-400 hover:text-white p-1"
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  New Password (min 6 chars)
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 pl-10 pr-10 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 text-slate-400 hover:text-white p-1"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Confirm New Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 pl-10 pr-10 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 text-slate-400 hover:text-white p-1"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-800 text-slate-300 py-3 rounded-xl font-bold text-xs hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all"
                >
                  {loading ? 'Updating...' : 'Save New Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
