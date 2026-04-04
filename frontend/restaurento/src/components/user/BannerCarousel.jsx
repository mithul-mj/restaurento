
import React, { useState, useEffect } from "react";

const BannerCarousel = ({ banners, isLoading }) => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (!banners || banners.length <= 1) return;

        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % banners.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [banners]);

    if (isLoading) {
        return <div className="w-full h-auto aspect-[16/5] rounded-b-[1rem] md:rounded-2xl bg-gray-200 animate-pulse mb-0" />;
    }

    const defaultBannerUrl = "https://res.cloudinary.com/dqswnl59e/image/upload/v1771654542/restaurento/onboading/qyihqvrcshwfiiwdbxlb.jpg";

    if (!banners || banners.length === 0) {
        return (
            <div className="relative w-full h-auto aspect-[16/5] rounded-b-[1rem] md:rounded-2xl overflow-hidden mb-0 bg-gray-100">
                <img
                    src={defaultBannerUrl}
                    className="w-full h-full object-cover"
                    alt="Default Banner"
                />
            </div>
        );
    }

    return (
        <div className="relative w-full h-auto aspect-[16/5] rounded-b-[1rem] md:rounded-2xl overflow-hidden mb-0 bg-gray-100">
            {/* Banner Images */}
            {banners.map((banner, i) => banner && (
                <a
                    key={banner._id || i}
                    href={banner.targetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${i === index ? "opacity-100 z-10" : "opacity-0 z-0"
                        }`}
                >
                    <img
                        src={banner.imageUrl}
                        className="w-full h-full object-cover"
                        alt="Banner"
                    />
                </a>
            ))}

            {/* Pagination Dots */}
            {banners.length > 1 && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                    {banners.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setIndex(i)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? "w-6 bg-white" : "w-1.5 bg-white/40"
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default BannerCarousel;
