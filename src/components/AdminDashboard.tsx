import React, { useState, useEffect } from 'react';
import { db, User, StoredSession } from '../services/db';
import { XMarkIcon, EyeIcon, UserGroupIcon, CurrencyDollarIcon, ShieldCheckIcon, HandThumbUpIcon, HandThumbDownIcon } from '@heroicons/react/24/solid';

interface AdminDashboardProps {
    onClose: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
    const [stats, setStats] = useState<any>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [userChats, setUserChats] = useState<StoredSession[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [statsData, usersData] = await Promise.all([
                db.getAdminStats(),
                db.getAdminUsers()
            ]);
            setStats(statsData);
            setUsers(usersData);
        } catch (e) {
            console.error("Admin Load Error", e);
        } finally {
            setLoading(false);
        }
    };

    const handleInspectUser = async (user: User) => {
        setSelectedUser(user);
        try {
            const chats = await db.getAdminUserChats(user.id);
            setUserChats(chats);
        } catch (e) {
            console.error("Chat Load Error", e);
        }
    };

    const handleDeleteUser = async (e: React.MouseEvent, userId: string) => {
        e.stopPropagation(); // Prevent opening inspector
        if (!window.confirm("CONFIRM EXECUTION: Permanently delete this agent and all associated archives? This action cannot be undone.")) return;

        try {
            await db.deleteAdminUser(userId);
            // Quick update local list
            setUsers(prev => prev.filter(u => u.id !== userId));
            if (selectedUser?.id === userId) {
                setSelectedUser(null);
                setUserChats([]);
            }
        } catch (err) {
            console.error("Deletion failed", err);
            alert("Execution Failed");
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col p-4 md:p-8 animate-in fade-in duration-300 overflow-y-auto md:overflow-hidden">

            {/* Header ... */}
            <div className="flex items-center justify-between mb-8 shrink-0 border-b border-zinc-800 pb-4">
                {/* ... existing header ... */}
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-950/30 border border-red-600 flex items-center justify-center rounded-sm">
                        <ShieldCheckIcon className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-oswald text-white uppercase tracking-widest text-glow-red">High Command</h2>
                        <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Surveillance & Logistics</div>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-500 hover:text-white">
                    <XMarkIcon className="w-8 h-8" />
                </button>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center text-zinc-500 font-mono animate-pulse min-h-[50vh]">
                    ESTABLISHING SECURE LINK...
                </div>
            ) : (
                <div className="flex-1 flex flex-col md:flex-row gap-6 md:overflow-hidden min-h-0">

                    {/* LEFT PANEL: STATS & USERS */}
                    <div className="flex-1 flex flex-col gap-6 md:overflow-hidden shrink-0">
                        {/* ... Stats Row ... */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0"> {/* Changed to 4 cols */}
                            <div className="bg-zinc-900 border border-zinc-700 p-4 rounded-sm">
                                <div className="text-xs text-zinc-500 uppercase font-bold mb-1 flex items-center gap-2">
                                    <UserGroupIcon className="w-4 h-4" /> Total Agents
                                </div>
                                <div className="text-2xl font-mono text-white">{stats?.total_users}</div>
                            </div>
                            <div className="bg-zinc-900 border border-zinc-700 p-4 rounded-sm">
                                <div className="text-xs text-zinc-500 uppercase font-bold mb-1 flex items-center gap-2">
                                    <CurrencyDollarIcon className="w-4 h-4" /> Reserves
                                </div>
                                <div className="text-2xl font-mono text-amber-500">{stats?.total_coins.toFixed(0)}</div>
                            </div>

                            {/* NEW: Referral Graph (Mini Bar) */}
                            <div className="bg-zinc-900 border border-zinc-700 p-4 rounded-sm col-span-2 flex flex-col justify-between">
                                <div className="text-xs text-zinc-500 uppercase font-bold mb-1">Recruitment Source</div>
                                <div className="flex items-center gap-2 h-4 mt-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-red-600"
                                        style={{ width: `${(stats?.referral_stats?.referred / (stats?.total_users || 1)) * 100}%` }}
                                    ></div>
                                    <div className="h-full bg-zinc-600 flex-1"></div>
                                </div>
                                <div className="flex justify-between text-[10px] font-mono mt-1">
                                    <span className="text-red-400">Referred: {stats?.referral_stats?.referred}</span>
                                    <span className="text-zinc-400">Independent: {stats?.referral_stats?.independent}</span>
                                </div>
                            </div>
                        </div>

                        {/* User List */}
                        <div className="h-[400px] md:h-auto md:flex-1 bg-zinc-900/50 border border-zinc-800 rounded-sm overflow-hidden flex flex-col shrink-0">
                            <div className="p-3 bg-zinc-900 border-b border-zinc-800 text-xs font-bold text-zinc-500 uppercase tracking-wider sticky top-0 flex justify-between">
                                <span>Agent Registry</span>
                                <span className="text-[10px] text-zinc-600">HOVER TO INSPECT</span>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 grid grid-cols-1 lg:grid-cols-2 gap-4 content-start">
                                {users.map(u => (
                                    <div
                                        key={u.id}
                                        onClick={() => handleInspectUser(u)}
                                        className={`
                                        flex flex-col p-4 rounded-sm border cursor-pointer transition-all duration-200 relative overflow-hidden group min-h-[140px]
                                        hover:-translate-y-1 hover:shadow-xl hover:border-red-500/50
                                        ${selectedUser?.id === u.id
                                                ? 'bg-red-950/20 border-red-900/50 text-white shadow-[0_0_15px_rgba(220,38,38,0.2)]'
                                                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                                            }
                                      `}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex flex-col mr-2 flex-1 min-w-0">
                                                <span className="font-oswald uppercase tracking-widest text-lg text-white group-hover:text-red-500 transition-colors break-words leading-tight">{u.username}</span>
                                                <span className="text-[9px] font-mono text-zinc-600 uppercase mt-1">ID: {u.id.substring(0, 8)}...</span>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <div className="flex items-center gap-2">
                                                    <ShieldCheckIcon className={`w-5 h-5 ${u.role === 'admin' ? 'text-red-500' : 'text-zinc-800'}`} />
                                                    {/* DELETE BUTTON */}
                                                    {u.role !== 'admin' && (
                                                        <button
                                                            onClick={(e) => handleDeleteUser(e, u.id)}
                                                            className="text-zinc-700 hover:text-red-600 transition-colors p-1"
                                                            title="Liquidate Agent"
                                                        >
                                                            <XMarkIcon className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Referral Counters */}
                                                <div className="mt-1 flex flex-col items-end text-[9px] font-mono">
                                                    <span className="text-zinc-500">Ref: <span className="text-white">{u.referrals_count || 0}</span></span>
                                                    <span className="text-zinc-500">Paid: <span className="text-amber-500">{u.paid_referrals_count || 0}</span></span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Rest of the component (truncated for brevity in diff but will be preserved by search-replace logic) */}
                                        <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                                            <span className={`text-[9px] px-2 py-0.5 rounded border uppercase font-bold tracking-wider
                                                ${u.subscription === 'commander' ? 'text-amber-500 border-amber-900/30 bg-amber-950/10' :
                                                    u.subscription === 'infantry' ? 'text-red-500 border-red-900/30 bg-red-950/10' :
                                                        'text-zinc-500 border-zinc-700 bg-zinc-950'}
                                             `}>
                                                {u.subscription}
                                            </span>
                                            <div className="flex items-center gap-1 text-[9px] text-zinc-500 font-mono">
                                                <CurrencyDollarIcon className="w-3 h-3 text-amber-900" />
                                                {u.coins?.toFixed(0) || 0}
                                            </div>
                                        </div>

                                        {/* Active Indicator Strip */}
                                        {selectedUser?.id === u.id && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600"></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL: CHAT INSPECTOR */}
                    <div className="h-[600px] md:h-auto md:flex-1 bg-black border border-zinc-800 rounded-sm overflow-hidden flex flex-col relative shrink-0">
                        {!selectedUser ? (
                            <div className="absolute inset-0 flex items-center justify-center text-zinc-700 font-mono text-sm uppercase tracking-widest pointer-events-none">
                                Select an Agent to Inspect
                            </div>
                        ) : (
                            <>
                                <div className="p-3 bg-zinc-900 border-b border-zinc-800 flex justify-between items-center shrink-0">
                                    <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                        Transcripts: <span className="text-white">{selectedUser.username}</span>
                                    </div>
                                    <div className="text-[10px] text-zinc-600 font-mono">
                                        {userChats.length} Sessions Found
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
                                    {userChats.length === 0 && (
                                        <div className="text-center text-zinc-600 py-10 text-xs font-mono">NO RECORDS FOUND</div>
                                    )}
                                    {userChats.map(session => (
                                        <div key={session.id} className="border border-zinc-800 bg-zinc-950 p-4 rounded-sm">
                                            <div className="flex justify-between items-center mb-4 border-b border-zinc-900 pb-2">
                                                <span className="text-xs text-red-500 font-bold uppercase">{session.title}</span>
                                                <span className="text-[10px] text-zinc-600">{new Date(session.timestamp).toLocaleString()}</span>
                                            </div>
                                            <div className="space-y-3">
                                                {session.messages.map((msg, idx) => (
                                                    <div key={idx} className={`flex ${msg.role === 'model' ? 'justify-end' : 'justify-start'}`}>
                                                        <div className={`max-w-[80%] text-xs font-mono p-2 rounded-sm flex flex-col gap-1 ${msg.role === 'model' ? 'bg-zinc-900 text-zinc-400 border border-zinc-800' : 'bg-zinc-800/50 text-zinc-300'}`}>
                                                            <div>{msg.parts[0].text}</div>
                                                            {/* Feedback Display */}
                                                            {msg.role === 'model' && (msg.feedback || msg.feedbackText) && (
                                                                <div className="mt-2 pt-2 border-t border-zinc-800 flex flex-col gap-1">
                                                                    <div className="flex items-center gap-2">
                                                                        {msg.feedback === 'like' && <div className="flex items-center gap-1 text-amber-600"><HandThumbUpIcon className="w-3 h-3" /><span className="text-[9px] uppercase">Commended</span></div>}
                                                                        {msg.feedback === 'dislike' && <div className="flex items-center gap-1 text-red-600"><HandThumbDownIcon className="w-3 h-3" /><span className="text-[9px] uppercase">Reported</span></div>}
                                                                    </div>
                                                                    {msg.feedbackText && (
                                                                        <div className="text-[11px] text-zinc-300 italic bg-zinc-800/80 border border-zinc-700 p-2 rounded mt-1 shadow-sm">
                                                                            "{msg.feedbackText}"
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
