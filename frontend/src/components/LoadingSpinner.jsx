const LoadingSpinner = ({ size = "md", fullScreen = false }) => {
    const sizeClasses = {
        sm: "h-5 w-5 border-2",
        md: "h-8 w-8 border-3",
        lg: "h-12 w-12 border-4",
        xl: "h-16 w-16 border-4"
    };

    const spinner = (
        <div className="flex flex-col items-center justify-center gap-3">
            <div className={`animate-spin rounded-full border-t-transparent border-blue-600 ${sizeClasses[size]}`}></div>
            {fullScreen && <span className="text-gray-500 font-medium text-sm animate-pulse">Loading content...</span>}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="flex items-center justify-center min-h-[200px] w-full bg-opacity-50 z-50">
                {spinner}
            </div>
        );
    }

    return <div className="flex justify-center p-2">{spinner}</div>;
};

export default LoadingSpinner;