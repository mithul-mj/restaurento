import React from "react";
import PotLoader from "./common/PotLoader";

const Loader = ({ className, size = "xs", text = "Loading", showText = false }) => {
    return (
        <div className={`inline-flex items-center justify-center ${className}`}>
            <PotLoader size={size} text={text} showText={showText} />
        </div>
    );
};

export default Loader;
