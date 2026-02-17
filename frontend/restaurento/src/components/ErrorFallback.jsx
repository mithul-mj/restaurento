import React from "react";

function ErrorFallback({ error, resetErrorBoundary }) {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 p-4 text-center">
            <div className="max-w-md rounded-lg bg-white p-8 shadow-lg">
                <h2 className="mb-4 text-2xl font-bold text-red-600">
                    Something went wrong
                </h2>
                <pre className="mb-4 text-sm text-gray-500">{error?.message}</pre>
                <button
                    onClick={resetErrorBoundary}
                    className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
                >
                    Try again
                </button>
            </div>
        </div>
    );
}

export default ErrorFallback;
