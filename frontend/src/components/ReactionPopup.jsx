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
        // Added pb-4 to bridge the hover gap
        <div className="absolute bottom-full left-0 pb-4 w-full flex justify-center z-50">
            <div className="bg-white rounded-full shadow-2xl border border-slate-100 p-2 flex gap-2 animate-scale-in">
                {reactions.map((r) => (
                    <button
                        key={r.type}
                        onClick={(e) => { e.stopPropagation(); onSelect(r.type); }}
                        className="w-10 h-10 flex items-center justify-center text-2xl hover:scale-125 transition-transform hover:bg-slate-50 rounded-full"
                        title={r.type}
                    >
                        {r.emoji}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ReactionPopup;