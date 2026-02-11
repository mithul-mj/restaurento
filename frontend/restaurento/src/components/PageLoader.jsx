import React from "react";
import Loader from "./Loader";

const PageLoader = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-white">
            <Loader size="medium" text="Loading" showText={true} />
        </div>
    );
};

export default PageLoader;
