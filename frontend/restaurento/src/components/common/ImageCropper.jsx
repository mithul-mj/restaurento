import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../../utils/canvasUtils';
import { Check, X, ZoomIn, ZoomOut } from 'lucide-react';
import { showToast } from '../../utils/alert';

const ImageCropper = ({ imageSrc, onCropComplete, onCancel, aspect = 16 / 9 }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Ensure the container is fully rendered before mounting Cropper
        const timer = setTimeout(() => setIsLoaded(true), 200);
        return () => clearTimeout(timer);
    }, []);

    const onCropChange = (crop) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom) => {
        setZoom(zoom);
    };

    const handleCropComplete = (croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const handleSave = async () => {
        if (!croppedAreaPixels) return;
        try {
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
            onCropComplete(croppedImage);
        } catch (e) {
            console.error("Cropping failed:", e);
        }
    };

    const modalContent = (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-4 border-b flex justify-between items-center bg-white shrink-0">
                    <div>
                        <h3 className="font-bold text-xl text-gray-800">Adjust Photo</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Drag to reposition, use slider to zoom</p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="relative flex-1 min-h-[300px] bg-gray-900 w-full overflow-hidden">
                    {isLoaded && (
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={aspect}
                            onCropChange={onCropChange}
                            onZoomChange={onZoomChange}
                            onCropComplete={handleCropComplete}
                            onMediaError={(err) => {
                                console.error("Cropper media error", err);
                                showToast("Could not load image. It might be corrupted or a non-image file.", "error");
                                onCancel();
                            }}
                            classes={{
                                containerClassName: "cropper-container",
                                mediaClassName: "cropper-media",
                                cropAreaClassName: "cropper-area"
                            }}
                        />
                    )}
                </div>

                <div className="p-4 bg-white border-t space-y-4 shrink-0">
                    <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <button
                            onClick={() => setZoom(Math.max(1, zoom - 0.1))}
                            className="p-1 hover:bg-gray-200 rounded text-gray-500"
                        >
                            <ZoomOut size={20} />
                        </button>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.01}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[#ff5e00]"
                        />
                        <button
                            onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                            className="p-1 hover:bg-gray-200 rounded text-gray-500"
                        >
                            <ZoomIn size={20} />
                        </button>
                    </div>

                    <div className="flex items-center justify-end gap-4 pb-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                        >
                            Discard
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={!isLoaded}
                            className="px-10 py-2.5 text-sm font-bold text-white bg-[#ff5e00] rounded-xl hover:bg-[#e65500] shadow-lg shadow-orange-100 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            <Check size={18} />
                            Apply Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default ImageCropper;


