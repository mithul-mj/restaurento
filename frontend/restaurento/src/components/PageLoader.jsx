import React from "react";
import PotLoader from "./common/PotLoader";

const PageLoader = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-white">
            <PotLoader size="medium" text="Loading" />
        </div>
    );
};

export default PageLoader;
