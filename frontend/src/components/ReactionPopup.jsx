import React from 'react';

const reactions = [
    { type: 'LIKE', emoji: '👍', color: 'text-blue-500' },
    { type: 'LOVE', emoji: '❤️', color: 'text-red-500' },
    { type: 'CELEBRATE', emoji: '🎉', color: 'text-yellow-500' },
    { type: 'INSIGHTFUL', emoji: '💡', color: 'text-yellow-400' },
    { type: 'CURIOUS', emoji: '🤔', color: 'text-purple-500' }
];

const ReactionPopup = ({ onSelect }) => {
    return (
        <div className="absolute bottom-full left-0 mb-2 bg-white rounded-full shadow-xl border border-slate-100 p-1 flex gap-1 animate-scale-in z-50">
            {reactions.map((r) => (
                <button
                    key={r.type}
                    onClick={(e) => { e.stopPropagation(); onSelect(r.type); }}
                    className="w-9 h-9 flex items-center justify-center text-xl hover:scale-125 transition-transform hover:bg-slate-50 rounded-full"
                    title={r.type}
                >
                    {r.emoji}
                </button>
            ))}
        </div>
    );
};

export default ReactionPopup;