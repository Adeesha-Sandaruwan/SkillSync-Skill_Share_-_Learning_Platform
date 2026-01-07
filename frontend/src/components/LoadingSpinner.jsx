const LoadingSpinner = ({ size = "medium", variant = "page", className = "" }) => {
    // VARIANT: BUTTON (Small, white, simple for inside buttons)
    if (variant === "button") {
        return (
            <div className={`relative flex items-center justify-center ${className}`}>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
        );
    }

    // VARIANT: PAGE (Full Logo Animation)
    // Scale based on size prop
    const scale = size === "small" ? "scale-50" : size === "large" ? "scale-150" : "scale-100";

    return (
        <div className={`flex flex-col items-center justify-center gap-4 w-full h-full animate-fade-in ${className}`}>

            {/* LOGO ANIMATION CONTAINER */}
            <div className={`relative w-20 h-20 ${scale} flex items-center justify-center`}>

                {/* 1. Outer Glowing Blur (Glassy Effect) */}
                <div className="absolute inset-0 bg-indigo-500/30 rounded-full blur-xl animate-pulse"></div>

                {/* 2. Rotating Sync Ring (Gradient) */}
                <svg
                    className="w-full h-full animate-[spin_3s_linear_infinite]"
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <linearGradient id="syncGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" /> {/* Blue-500 */}
                            <stop offset="100%" stopColor="#8b5cf6" /> {/* Violet-500 */}
                        </linearGradient>
                    </defs>

                    {/* Top Arc */}
                    <path
                        d="M50 10 A 40 40 0 0 1 90 50"
                        stroke="url(#syncGradient)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        className="opacity-90"
                    />
                    {/* Bottom Arc */}
                    <path
                        d="M50 90 A 40 40 0 0 1 10 50"
                        stroke="url(#syncGradient)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        className="opacity-90"
                    />

                    {/* Arrow Heads */}
                    <path d="M90 50 L 85 35 L 98 40 Z" fill="#8b5cf6" />
                    <path d="M10 50 L 15 65 L 2 60 Z" fill="#3b82f6" />
                </svg>

                {/* 3. Central "S" (Static or Pulsing) */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-br from-blue-600 to-indigo-700 animate-pulse">
                        S
                    </span>
                </div>
            </div>

            {/* TEXT (Only for medium/large) */}
            {(size === "medium" || size === "large") && (
                <div className="flex flex-col items-center">
                    <h1 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 tracking-tight">
                        SkillSync
                    </h1>
                    <div className="flex gap-1 mt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce"></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoadingSpinner;