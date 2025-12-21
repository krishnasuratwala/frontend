import React, { useState } from 'react';
import { XMarkIcon, ClipboardDocumentIcon, CheckIcon, CurrencyDollarIcon } from '@heroicons/react/24/solid';
import { User } from '../services/db';

interface ReferralModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}

const ReferralModal: React.FC<ReferralModalProps> = ({ isOpen, onClose, user }) => {
    const [copied, setCopied] = useState(false);

    if (!isOpen || !user) return null;

    // DYNAMIC LINK: Uses window.location.origin (e.g. https://myapp.onrender.com or http://localhost:5173)
    const referralLink = `${window.location.origin}/?ref=${user.username}`;
    const earnings = user.affiliate_balance || 0;

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#121212] border border-zinc-700 shadow-2xl relative font-typewriter animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
                    <h2 className="text-lg font-oswald uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                        <CurrencyDollarIcon className="w-5 h-5" />
                        Classified Commission
                    </h2>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-white mb-1 tracking-tight">${earnings.toFixed(2)}</div>
                        <div className="text-xs text-zinc-500 uppercase tracking-widest">Total Earnings</div>
                    </div>

                    <div className="bg-zinc-900/50 p-4 border border-zinc-800 rounded">
                        <label className="text-[10px] uppercase text-zinc-500 font-bold block mb-2">Your Unique Operations Link</label>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 bg-black p-3 text-xs text-zinc-300 truncate font-mono border border-zinc-700">{referralLink}</code>
                            <button
                                onClick={handleCopy}
                                className={`p-3 border transition-all ${copied ? 'bg-emerald-900/30 border-emerald-600 text-emerald-500' : 'bg-zinc-800 border-zinc-600 hover:bg-zinc-700 text-white'}`}
                                title="Copy Link"
                            >
                                {copied ? <CheckIcon className="w-4 h-4" /> : <ClipboardDocumentIcon className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="text-xs text-zinc-400 leading-relaxed text-center border-t border-zinc-800 pt-4">
                        <p>Recruit new agents to the cause.</p>
                        <p className="mt-2 text-emerald-500/80">Earn <span className="font-bold text-emerald-400">20% commission</span> on every subscription paid by operatives you recruit.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReferralModal;
