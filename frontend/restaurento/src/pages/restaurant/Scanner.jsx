import React, { useState, useRef, useEffect } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { CheckCircle, RefreshCw, XCircle, ChevronLeft, Upload, Camera, CameraOff, Scan } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import restaurantService from '../../services/restaurant.service';
import { showToast } from '../../utils/alert';
import { useNavigate } from 'react-router-dom';

const Scanner = () => {
    const [scanResult, setScanResult] = useState(null);
    const [error, setError] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const navigate = useNavigate();

    const scannerRef = useRef(null);

    const shutdownScanner = async () => {
        if (scannerRef.current) {
            const scanner = scannerRef.current;
            scannerRef.current = null;

            try {
                if (scanner.getState() === Html5QrcodeScannerState.SCANNING ||
                    scanner.getState() === Html5QrcodeScannerState.PAUSED) {
                    await scanner.stop().catch(() => { });
                }
                await scanner.clear().catch(() => { });
            } catch (e) { }
        }

        document.querySelectorAll('video').forEach(video => {
            if (video.srcObject instanceof MediaStream) {
                video.srcObject.getTracks().forEach(track => {
                    track.stop();
                    track.enabled = false;
                });
                video.srcObject = null;
            }
            video.pause();
            video.innerHTML = '';
            if (video.parentNode) {
                try { video.parentNode.removeChild(video); } catch (e) { }
            }
        });

        setIsScanning(false);
    };

    const startScanner = async () => {
        try {
            await shutdownScanner();
            setError(null);
            setScanResult(null);

            if (!document.getElementById('reader')) return;

            const scanner = new Html5Qrcode("reader");
            scannerRef.current = scanner;

            const config = {
                fps: 10,
                qrbox: (w, h) => {
                    const size = Math.max(250, Math.min(w, h) * 0.7);
                    return { width: size, height: size };
                }
            };

            const devices = await Html5Qrcode.getCameras().catch(() => []);
            setIsScanning(true);

            const onScanSuccess = async (text) => {
                await shutdownScanner();
                handleProcess(text);
            };

            if (devices.length > 0) {
                const backCamera = devices.find(d => d.label.toLowerCase().includes('back')) || devices[0];
                await scanner.start(backCamera.id, config, onScanSuccess, () => { });
            } else {
                await scanner.start({ facingMode: "environment" }, config, onScanSuccess, () => { });
            }
        } catch (err) {
            setError("Camera failed to start. Please check permissions.");
            setIsScanning(false);
        }
    };

    const handleProcess = async (token) => {
        setIsVerifying(true);
        setError(null);
        try {
            const resp = await restaurantService.verifyCheckIn(token);
            setScanResult(resp.guest);
            showToast("Verified", "success");
        } catch (err) {
            setError(err.response?.data?.message || "Invalid Ticket");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        await shutdownScanner();
        setIsVerifying(true);
        try {
            const temp = new Html5Qrcode("reader-hidden");
            const text = await temp.scanFile(file, true);
            handleProcess(text);
        } catch {
            setError("No QR code found in photo.");
        } finally {
            setIsVerifying(false);
            if (e.target) e.target.value = '';
        }
    };

    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                const s = scannerRef.current;
                if (s.getState() > 1) s.stop().catch(() => { }).finally(() => s.clear().catch(() => { }));
            }
        };
    }, []);

    const reset = () => {
        setError(null);
        setScanResult(null);
        setIsScanning(false);
    };

    return (
        <div className="min-h-screen bg-[#fcfcfc] font-sans p-4 md:p-8">
            <div className="max-w-4xl mx-auto flex items-center justify-between mb-10">
                <div className="flex items-center gap-5">
                    <button onClick={async () => { await shutdownScanner(); navigate(-1); }} className="p-3 bg-white shadow-sm border rounded-2xl hover:bg-gray-50 active:scale-95 transition-all">
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Check-in</h1>
                        <p className="text-xs font-black text-orange-500 uppercase tracking-widest">Restauranto Terminal</p>
                    </div>
                </div>
            </div>

            <div className="max-w-xl mx-auto">
                <AnimatePresence mode="wait">
                    {!scanResult && !error && !isVerifying ? (
                        <motion.div key="scanner-ui" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-white rounded-[40px] p-8 shadow-2xl border flex flex-col gap-6">
                            <div className="text-center">
                                <h2 className="text-2xl font-black text-gray-900">Scan Guest Ticket</h2>
                            </div>

                            <div className={`relative aspect-square transition-all duration-700 ${isScanning ? 'scale-100' : 'scale-95 opacity-40 grayscale'}`}>
                                <div id="reader" className="w-full h-full bg-black rounded-[32px] overflow-hidden border-4 border-white shadow-xl"></div>
                                {isScanning && (
                                    <div className="absolute inset-0 pointer-events-none p-12">
                                        <div className="w-full h-full border-2 border-dashed border-white/20 rounded-3xl relative overflow-hidden">
                                            <motion.div animate={{ top: ['0%', '100%', '0%'] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="absolute left-0 right-0 h-1 bg-orange-400 shadow-[0_0_20px_#fb923c]" />
                                        </div>
                                    </div>
                                )}
                                {!isScanning && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Scan size={64} className="text-white/20" />
                                    </div>
                                )}
                            </div>

                            <div className="grid gap-4">
                                <button
                                    onClick={isScanning ? shutdownScanner : startScanner}
                                    className={`w-full py-6 rounded-[32px] font-black text-xl shadow-xl flex items-center justify-center gap-4 transition-all active:scale-95 ${isScanning ? 'bg-gray-900 text-white' : 'bg-orange-500 text-white hover:bg-orange-600'}`}
                                >
                                    {isScanning ? <><CameraOff size={28} /> Stop Camera</> : <><Camera size={28} /> Open Camera</>}
                                </button>

                                <label className="cursor-pointer group">
                                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                                    <div className="py-5 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200 flex items-center justify-center gap-3 transition-all hover:bg-orange-50 border-orange-100/0 hover:border-orange-200">
                                        <Upload className="text-gray-400 group-hover:text-orange-500" size={24} />
                                        <span className="font-bold text-gray-400 group-hover:text-gray-900">Upload Ticket from Gallery</span>
                                    </div>
                                </label>
                            </div>
                            <div id="reader-hidden" className="hidden"></div>
                        </motion.div>
                    ) : isVerifying ? (
                        <motion.div key="verifying-ui" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white rounded-[40px] p-24 shadow-2xl text-center border">
                            <RefreshCw size={80} className="text-orange-500 animate-spin mx-auto mb-8" />
                            <h2 className="text-2xl font-black text-gray-900">Verifying Booking...</h2>
                        </motion.div>
                    ) : scanResult ? (
                        <motion.div key="success-ui" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[40px] shadow-2xl overflow-hidden border">
                            <div className="bg-emerald-500 p-14 text-center text-white">
                                <CheckCircle size={100} className="mx-auto mb-6 drop-shadow-lg" />
                                <h2 className="text-4xl font-black tracking-tight">Verified</h2>
                                <p className="text-emerald-50 mt-2 font-bold opacity-80 uppercase tracking-widest text-[10px]">Guest Check-in Complete</p>
                            </div>
                            <div className="p-10 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-8 bg-gray-50 rounded-[32px] border border-gray-100">
                                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Guest</p>
                                        <p className="text-2xl font-black text-gray-900 truncate">{scanResult.name}</p>
                                    </div>
                                    <div className="p-8 bg-gray-50 rounded-[32px] border border-gray-100">
                                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Party</p>
                                        <p className="text-2xl font-black text-gray-900">{scanResult.guests} People</p>
                                    </div>
                                </div>
                                <button onClick={reset} className="w-full py-6 bg-black text-white rounded-[32px] font-black text-xl active:scale-95 transition-all">Next Guest</button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="error-ui" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-[40px] p-16 shadow-2xl text-center border-red-50 border">
                            <XCircle className="text-red-500 mx-auto mb-8" size={100} />
                            <h2 className="text-3xl font-black text-gray-900">Unauthorized</h2>
                            <p className="text-red-600 font-bold mt-6 bg-red-50 py-4 px-8 rounded-3xl inline-block border border-red-100">{error}</p>
                            <button onClick={reset} className="w-full py-6 bg-black text-white rounded-[32px] font-black mt-10 active:scale-95 transition-all">Try Again</button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Scanner;
