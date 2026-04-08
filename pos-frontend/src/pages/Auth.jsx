import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, registerUser, clearError, selectAuthLoading, selectAuthError } from '../redux/slices/authSlice.js';
import { BiSolidDish } from 'react-icons/bi';
import { FaEye, FaEyeSlash, FaLock, FaUser, FaEnvelope } from 'react-icons/fa';

const Auth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading  = useSelector(selectAuthLoading);
  const error    = useSelector(selectAuthError);

  const [mode, setMode]            = useState('login');
  const [showPassword, setShowPwd] = useState(false);
  const [form, setForm]            = useState({ name: '', email: '', password: '' });

  useEffect(() => { dispatch(clearError()); }, [mode]);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const action = mode === 'login'
      ? loginUser({ email: form.email, password: form.password })
      : registerUser(form);

    const result = await dispatch(action);
    if (result.meta.requestStatus === 'fulfilled') navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#1f1f1f] flex">

      {/* Left Branding Panel */}
      <div className="hidden lg:flex flex-[1.2] flex-col items-center justify-center bg-[#1a1a1a] border-r border-[#2e2e2e] px-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-[#f6b100] p-4 rounded-2xl">
            <BiSolidDish size={40} className="text-white" />
          </div>
          <h1 className="text-[#f5f5f5] text-4xl font-bold tracking-tight">EOM</h1>
        </div>
        <h2 className="text-[#f5f5f5] text-2xl font-semibold text-center mb-3">
          Restaurant POS System
        </h2>
        <p className="text-[#ababab] text-center text-sm leading-relaxed max-w-xs">
          Manage your orders, tables, and menu all in one place. Fast, intuitive, and reliable.
        </p>
        <div className="mt-10 flex flex-col gap-3 w-full max-w-xs">
          {['Order Management', 'Table Tracking', 'Payment Gateway', 'Invoice Generation'].map((f) => (
            <div key={f} className="flex items-center gap-3 bg-[#262626] rounded-xl px-4 py-3">
              <span className="w-2 h-2 rounded-full bg-[#f6b100]" />
              <p className="text-[#f5f5f5] text-sm font-medium">{f}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-md">

          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-3 mb-10 justify-center">
            <div className="bg-[#f6b100] p-3 rounded-xl">
              <BiSolidDish size={28} className="text-white" />
            </div>
            <h1 className="text-[#f5f5f5] text-3xl font-bold">EOM</h1>
          </div>

          <h2 className="text-[#f5f5f5] text-3xl font-bold mb-1">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-[#ababab] text-sm mb-8">
            {mode === 'login'
              ? 'Sign in to your account to continue'
              : 'Register a new cashier account'}
          </p>

          {/* Mode Toggle */}
          <div className="flex bg-[#262626] rounded-xl p-1 mb-6">
            {['login', 'register'].map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  mode === m ? 'bg-[#f6b100] text-black' : 'text-[#ababab]'
                }`}>
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Name — Register only */}
            {mode === 'register' && (
              <div>
                <label className="block text-[#ababab] text-sm font-medium mb-2">
                  Full Name
                </label>
                <div className="flex items-center gap-3 bg-[#262626] border border-[#333] rounded-xl px-4 py-3 focus-within:border-[#f6b100] transition-colors">
                  <FaUser className="text-[#ababab] text-sm" />
                  <input type="text" name="name" value={form.name}
                    onChange={handleChange} placeholder="Enter your full name"
                    className="bg-transparent flex-1 text-[#f5f5f5] text-sm focus:outline-none placeholder:text-[#555]" />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-[#ababab] text-sm font-medium mb-2">
                Email
              </label>
              <div className="flex items-center gap-3 bg-[#262626] border border-[#333] rounded-xl px-4 py-3 focus-within:border-[#f6b100] transition-colors">
                <FaEnvelope className="text-[#ababab] text-sm" />
                <input type="email" name="email" value={form.email}
                  onChange={handleChange} placeholder="Enter your email"
                  className="bg-transparent flex-1 text-[#f5f5f5] text-sm focus:outline-none placeholder:text-[#555]" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[#ababab] text-sm font-medium mb-2">
                Password
              </label>
              <div className="flex items-center gap-3 bg-[#262626] border border-[#333] rounded-xl px-4 py-3 focus-within:border-[#f6b100] transition-colors">
                <FaLock className="text-[#ababab] text-sm" />
                <input type={showPassword ? 'text' : 'password'} name="password"
                  value={form.password} onChange={handleChange}
                  placeholder="Enter your password"
                  className="bg-transparent flex-1 text-[#f5f5f5] text-sm focus:outline-none placeholder:text-[#555]" />
                <button type="button" onClick={() => setShowPwd((p) => !p)}
                  className="text-[#ababab] hover:text-[#f5f5f5] transition-colors">
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-red-400 text-sm bg-[#4a1a1a] border border-red-800 rounded-lg px-4 py-2">
                {error}
              </p>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full bg-[#f6b100] hover:bg-[#d49a00] disabled:opacity-60 text-white font-semibold rounded-xl py-3 mt-2 transition-colors">
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
