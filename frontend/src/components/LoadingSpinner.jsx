import { BlinkBlur, ThreeDot } from "react-loading-indicators";

const LoadingSpinner = ({ size = "medium", color = "#3b82f6", variant = "page", className = "" }) => {
    // variant="button" -> Small dots for inside buttons
    // variant="page"   -> Full BlinkBlur with text

    if (variant === "button") {
        return (
            <div className={`flex justify-center items-center ${className}`}>
                <ThreeDot color="#ffffff" size="small" text="" textColor="" />
            </div>
        );
    }

    return (
        <div className={`flex flex-col items-center justify-center p-4 gap-4 w-full h-full ${className}`}>
            <BlinkBlur color={color} size={size} text="" textColor="" />
            {/* Only show text if it's a large page load, to save space in smaller lists */}
            {size === "medium" || size === "large" ? (
                <p className="text-gray-900 font-bold text-[10px] tracking-[0.2em] animate-pulse">
                    LOADING
                </p>
            ) : null}
        </div>
    );
};

export default LoadingSpinner;