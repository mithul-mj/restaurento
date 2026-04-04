import React, { useState, useEffect } from "react";
import { ChefHat, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

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

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset, velocity) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      let nextIndex = prevIndex + newDirection;
      if (nextIndex < 0) nextIndex = count - 1;
      if (nextIndex >= count) nextIndex = 0;
      return nextIndex;
    });
  };

  // Mobile Carousel View
  const MobileCarousel = () => (
    <div className="relative h-[300px] w-full md:hidden rounded-2xl overflow-hidden group">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x);
            if (swipe < -swipeConfidenceThreshold) {
              paginate(1);
            } else if (swipe > swipeConfidenceThreshold) {
              paginate(-1);
            }
          }}
          className="absolute inset-0 w-full h-full"
        >
          <ImgDiv src={displayImages[currentIndex]} loading="eager" />
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      {count > 1 && (
        <>
          <button
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white"
            onClick={() => paginate(-1)}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white"
            onClick={() => paginate(1)}
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Pagination Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-1.5 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-sm">
        {displayImages.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? "w-6 bg-white" : "w-1.5 bg-white/50"
              }`}
          />
        ))}
      </div>
      
      {/* Count Badge */}
      <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-white text-[10px] font-bold">
        {currentIndex + 1} / {count}
      </div>
    </div>
  );

  // Desktop Grid Views (Original Logic)
  const DesktopGrid = () => {
    if (count === 1) {
      return (
        <div className="hidden md:block h-[400px] rounded-3xl overflow-hidden">
          <ImgDiv src={displayImages[0]} loading="eager" />
        </div>
      );
    }
    if (count === 2) {
      return (
        <div className="hidden md:grid md:grid-cols-2 gap-2 h-[400px] rounded-3xl overflow-hidden">
          <ImgDiv src={displayImages[0]} loading="eager" />
          <ImgDiv src={displayImages[1]} />
        </div>
      );
    }
    if (count === 3) {
      return (
        <div className="hidden md:grid md:grid-cols-3 gap-2 h-[400px] rounded-3xl overflow-hidden">
          <div className="md:col-span-2 h-full">
            <ImgDiv src={displayImages[0]} loading="eager" />
          </div>
          <div className="grid grid-rows-2 gap-2 h-full">
            <ImgDiv src={displayImages[1]} />
            <ImgDiv src={displayImages[2]} />
          </div>
        </div>
      );
    }
    if (count === 4) {
      return (
        <div className="hidden md:grid md:grid-cols-2 gap-2 h-[400px] rounded-3xl overflow-hidden">
          <ImgDiv src={displayImages[0]} loading="eager" />
          <div className="h-full w-full flex flex-col gap-2">
            <div className="flex-1 w-full min-h-0">
              <ImgDiv src={displayImages[1]} />
            </div>
            <div className="flex-1 w-full min-h-0 grid grid-cols-2 gap-2">
              <ImgDiv src={displayImages[2]} />
              <ImgDiv src={displayImages[3]} />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="hidden md:grid md:grid-cols-[2fr_1fr_1fr] gap-2 h-[400px] rounded-3xl overflow-hidden">
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

  return (
    <>
      <MobileCarousel />
      <DesktopGrid />
    </>
  );
};

export default ImageGallery;
