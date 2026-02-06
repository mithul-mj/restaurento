import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../../utils/canvasUtils';
import { Check, X, ZoomIn, ZoomOut } from 'lucide-react';

const ImageCropper = ({ imageSrc, onCropComplete, onCancel, aspect = 16 / 9 }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

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
        try {
            // Get the cropped image as a Data URL string
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
            onCropComplete(croppedImage);
        } catch (e) {
            console.error("Cropping failed:", e);
        }
    };

    const modalContent = (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b flex justify-between items-center bg-white">
                    <h3 className="font-semibold text-lg text-gray-800">Crop Image</h3>
                    <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>

                <div className="relative h-[400px] w-full bg-gray-900">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspect}
                        onCropChange={onCropChange}
                        onZoomChange={onZoomChange}
                        onCropComplete={handleCropComplete}
                    />
                </div>

                <div className="p-4 bg-white flex flex-col gap-4">
                    <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg">
                        <ZoomOut size={18} className="text-gray-500" />
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(e.target.value)}
                            className="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-[#ff5e00]"
                        />
                        <ZoomIn size={18} className="text-gray-500" />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="px-6 py-2 text-sm font-medium text-white bg-[#ff5e00] rounded-lg hover:bg-[#e65500] transition-colors flex items-center gap-2"
                        >
                            <Check size={16} />
                            Save Crop
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default ImageCropper;
