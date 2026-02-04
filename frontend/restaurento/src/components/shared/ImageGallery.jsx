import React from "react";
import { ChefHat } from "lucide-react";

const ImgDiv = ({ src, className, loading = "lazy" }) => (
  <div
    className={`overflow-hidden w-full h-full ${className || ""} bg-gray-100 flex-shrink-0`}>
    {src ? (
      <img
        src={src}
        loading={loading}
        className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
        alt="Restaurant"
        style={{ minHeight: "100%", minWidth: "100%" }}
      />
    ) : (
      <div className="w-full h-full flex items-center justify-center text-gray-300">
        <ChefHat size={24} />
      </div>
    )}
  </div>
);

const ImageGallery = ({ images = [] }) => {
  const galleryImages =
    images.length > 0
      ? images
      : [
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200",
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200",
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200",
      ];

  const displayImages = galleryImages.slice(0, 5);
  const count = displayImages.length;

  if (count === 1) {
    return (
      <div className="h-[300px] md:h-[400px] rounded-3xl overflow-hidden">
        <ImgDiv src={displayImages[0]} loading="eager" />
      </div>
    );
  }
  if (count === 2) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 h-[300px] md:h-[400px] rounded-3xl overflow-hidden">
        <div className="h-full w-full">
          <ImgDiv src={displayImages[0]} loading="eager" />
        </div>
        <div className="h-full w-full">
          <ImgDiv src={displayImages[1]} />
        </div>
      </div>
    );
  }
  if (count === 3) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 h-[300px] md:h-[400px] rounded-3xl overflow-hidden">
        <div className="md:col-span-2 h-full">
          <ImgDiv src={displayImages[0]} loading="eager" />
        </div>
        <div className="grid grid-rows-2 gap-2 h-full">
          <div className="h-full w-full">
            <ImgDiv src={displayImages[1]} />
          </div>
          <div className="h-full w-full">
            <ImgDiv src={displayImages[2]} />
          </div>
        </div>
      </div>
    );
  }
  if (count === 4) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 h-[300px] md:h-[400px] rounded-3xl overflow-hidden">
        <div className="h-full w-full">
          <ImgDiv src={displayImages[0]} loading="eager" />
        </div>
        <div className="h-full w-full flex flex-col gap-2">
          <div className="flex-1 w-full min-h-0">
            <ImgDiv src={displayImages[1]} />
          </div>
          <div className="flex-1 w-full min-h-0 grid grid-cols-2 gap-2">
            <div className="h-full w-full">
              <ImgDiv src={displayImages[2]} />
            </div>
            <div className="h-full w-full">
              <ImgDiv src={displayImages[3]} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-2 h-[300px] md:h-[400px] rounded-3xl overflow-hidden">
      <div className="h-full w-full">
        <ImgDiv src={displayImages[0]} loading="eager" />
      </div>
      <div className="h-full w-full flex flex-col gap-2">
        <div className="flex-1 w-full min-h-0">
          <ImgDiv src={displayImages[1]} />
        </div>
        <div className="flex-1 w-full min-h-0">
          <ImgDiv src={displayImages[2]} />
        </div>
      </div>
      <div className="h-full w-full flex flex-col gap-2">
        <div className="flex-1 w-full min-h-0">
          <ImgDiv src={displayImages[3]} />
        </div>
        <div className="flex-1 w-full min-h-0">
          <ImgDiv src={displayImages[4]} />
        </div>
      </div>
    </div>
  );
};

export default ImageGallery;
