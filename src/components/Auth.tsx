
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { LockClosedIcon, FingerPrintIcon, UserIcon, ShieldCheckIcon, UserGroupIcon, CommandLineIcon } from '@heroicons/react/24/solid';
import { db, User } from '../services/db';

interface AuthProps {
    onLogin: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
    // Tabs: 'user' | 'admin'
    const [activeTab, setActiveTab] = useState<'user' | 'admin'>('user');

    // User View: 'login' | 'signup'
    const [userView, setUserView] = useState<'login' | 'signup'>('login');

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    // Admin specific state
    const [adminUser, setAdminUser] = useState('');
    const [adminPass, setAdminPass] = useState('');

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            if (activeTab === 'admin') {
                // Admin Login
                const user = await db.login(adminUser, adminPass, 'admin');
                if (user.role !== 'admin') {
                    throw new Error("ACCESS_DENIED: INSUFFICIENT CLEARANCE");
                }
                onLogin(user);
            } else {
                // User Login/Signup
                if (userView === 'login') {
                    const user = await db.login(username, password, 'user');
                    onLogin(user);
                } else {
                    const user = await db.signup(username, password);
                    onLogin(user);
                }
            }
        } catch (err: any) {
            setError(err.message || "AUTHENTICATION_FAILED");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#1a1a1a] font-typewriter relative overflow-hidden text-zinc-300">
            {/* Immersive Background */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618335829737-2228915674e0?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-20 contrast-125 grayscale"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>

            {/* Noise Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjZmZmIj48L3JlY3Q+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiPjwvcmVjdD4KPC9zdmc+')]"></div>

            {/* Auth Card / Dossier */}
            <div className="relative z-10 w-full max-w-md p-8">

                {/* Top Secret Stamp */}
                <div className="absolute -top-6 -right-6 w-32 h-32 border-4 border-red-900/40 rounded-full flex items-center justify-center -rotate-12 animate-pulse pointer-events-none mix-blend-overlay">
                    <span className="text-red-900/40 font-black text-xl uppercase tracking-widest text-center">Eyes<br />Only</span>
                </div>

                <div className="bg-[#121212] border border-zinc-700 shadow-2xl relative flex flex-col">
                    {/* Header Plate */}
                    <div className="bg-zinc-900 p-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                            <ShieldCheckIcon className="w-6 h-6 text-red-700" />
                            <h1 className="text-xl font-oswald uppercase tracking-widest text-zinc-100">
                                Dictator<span className="text-red-700">Ai</span>
                            </h1>
                        </div>
                        <div className="text-[10px] font-mono text-zinc-500 border border-zinc-700 px-2 py-0.5 rounded">
                            SECURE_LOGIN_V2.0
                        </div>
                    </div>

                    {/* TABS */}
                    <div className="flex border-b border-zinc-800 bg-zinc-950/50">
                        <button
                            onClick={() => { setActiveTab('user'); setError(null); }}
                            className={`flex-1 py-3 text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'user' ? 'bg-[#121212] text-white border-t-2 border-red-600' : 'text-zinc-600 hover:text-zinc-400'}`}
                        >
                            <UserGroupIcon className="w-4 h-4" /> Agent Access
                        </button>
                        <button
                            onClick={() => { setActiveTab('admin'); setError(null); }}
                            className={`flex-1 py-3 text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'admin' ? 'bg-[#121212] text-red-500 border-t-2 border-red-800' : 'text-zinc-600 hover:text-zinc-400'}`}
                        >
                            <CommandLineIcon className="w-4 h-4" /> High Command
                        </button>
                    </div>

                    <div className="p-8 relative">
                        {/* Form Title */}
                        <h2 className="text-center text-lg uppercase tracking-[0.2em] font-bold text-zinc-400 mb-8 border-b border-dashed border-zinc-700 pb-4">
                            {activeTab === 'user'
                                ? (userView === 'login' ? 'Identity Verification' : 'New Agent Registration')
                                : 'Restricted Access Protocol'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {activeTab === 'user' ? (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-wider text-red-800 font-bold flex items-center gap-2">
                                            <UserIcon className="w-3 h-3" /> Agent ID
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="w-full bg-black/50 border-b-2 border-zinc-700 focus:border-red-700 px-3 py-2 outline-none transition-colors font-mono text-zinc-200 placeholder-zinc-700"
                                            placeholder="ENTER CODENAME"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-wider text-red-800 font-bold flex items-center gap-2">
                                            <LockClosedIcon className="w-3 h-3" /> Access Code
                                        </label>
                                        <input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-black/50 border-b-2 border-zinc-700 focus:border-red-700 px-3 py-2 outline-none transition-colors font-mono text-zinc-200 placeholder-zinc-700"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </>
                            ) : (
                                /* ADMIN FORM */
                                <>
                                    <div className="bg-red-950/10 border border-red-900/30 p-3 mb-4 text-[10px] text-red-400 font-mono text-center">
                                        WARNING: UNAUTHORIZED ACCESS ATTEMPT WILL BE LOGGED.
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-wider text-red-600 font-bold flex items-center gap-2">
                                            <UserIcon className="w-3 h-3" /> Commander ID
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={adminUser}
                                            onChange={(e) => setAdminUser(e.target.value)}
                                            className="w-full bg-black/50 border-b-2 border-red-900 focus:border-red-500 px-3 py-2 outline-none transition-colors font-mono text-red-100 placeholder-red-900/50"
                                            placeholder="HIGH COMMAND"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-wider text-red-600 font-bold flex items-center gap-2">
                                            <LockClosedIcon className="w-3 h-3" /> Security Token
                                        </label>
                                        <input
                                            type="password"
                                            required
                                            value={adminPass}
                                            onChange={(e) => setAdminPass(e.target.value)}
                                            className="w-full bg-black/50 border-b-2 border-red-900 focus:border-red-500 px-3 py-2 outline-none transition-colors font-mono text-red-100 placeholder-red-900/50"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </>
                            )}

                            {error && (
                                <div className="text-red-500 text-xs font-bold bg-red-950/20 p-2 border-l-2 border-red-600 animate-pulse">
                                    ERROR: {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-3 uppercase tracking-widest font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 group mt-4 relative overflow-hidden border ${activeTab === 'admin' ? 'bg-red-950 text-red-500 border-red-600 hover:bg-red-900 hover:text-white' : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700 hover:text-white'}`}
                            >
                                {isLoading ? (
                                    <span className="animate-pulse">Verifying Credentials...</span>
                                ) : (
                                    <>
                                        <span>{activeTab === 'admin' ? 'Authorize' : (userView === 'login' ? 'Authenticate' : 'Submit Dossier')}</span>
                                        <FingerPrintIcon className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Switcher only for User Tab */}
                        {activeTab === 'user' && (
                            <div className="mt-8 text-center">
                                <button
                                    onClick={() => {
                                        setUserView(userView === 'login' ? 'signup' : 'login');
                                        setError(null);
                                    }}
                                    className="text-[10px] uppercase tracking-wider text-zinc-600 hover:text-zinc-400 border-b border-transparent hover:border-zinc-500 transition-colors"
                                >
                                    {userView === 'login' ? 'Request New Clearance Level' : 'Return to Login Terminal'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Decorative Footer */}
                    <div className="bg-zinc-950 p-2 border-t border-zinc-800 flex justify-between items-center text-[9px] text-zinc-700 font-mono uppercase">
                        <span>System: ONLINE</span>
                        <span>Encrypted: AES-256</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
