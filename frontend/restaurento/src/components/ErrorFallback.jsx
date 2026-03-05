import React from "react";

function ErrorFallback({ error, resetErrorBoundary }) {
    return (
        <div className="flex w-full flex-col items-center justify-center rounded-lg border border-red-100 bg-red-50 p-8 text-center mt-4 shadow-sm">
            <div className="max-w-md">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                    <svg
                        className="h-8 w-8 text-red-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                </div>
                <h3 className="mb-2 text-lg font-bold text-red-800">
                    Failed to load this section
                </h3>
                <p className="mb-6 text-sm text-red-600 font-medium">
                    {error?.message || "An unexpected error occurred while rendering this content."}
                </p>
                <button
                    onClick={resetErrorBoundary}
                    className="rounded-md bg-red-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
                >
                    Try again
                </button>
            </div>
        </div>
    );
}

export default ErrorFallback;
