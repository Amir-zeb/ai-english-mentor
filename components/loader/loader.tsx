import React from 'react'

type LoaderProps = {
    message?: string;
    isLoading?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ message = 'Loading...', isLoading = false }) => {
    if (!isLoading) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden />

            {/* Centered loader */}
            <div className="relative flex flex-col items-center gap-4 p-6">
                <svg
                    className="animate-spin h-16 w-16 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                </svg>

                <span className="text-sm font-medium text-white">{message}</span>
            </div>
        </div>
    )
}

export default Loader
