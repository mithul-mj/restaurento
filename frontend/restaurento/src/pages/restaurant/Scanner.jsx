import React, { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { CheckCircle, RefreshCw, XCircle, Camera, CameraOff, Scan } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import restaurantService from '../../services/restaurant.service';
import { showToast } from '../../utils/alert';

const Scanner = () => {
    const [scanResult, setScanResult] = useState(null);
    const [error, setError] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [manualToken, setManualToken] = useState('');
    const scannerRef = useRef(null);

    const shutdownScanner = async () => {
        if (scannerRef.current) {
            try {
                if (scannerRef.current.getState() > 1) {
                    await scannerRef.current.stop();
                }
                await scannerRef.current.clear();
            } catch (e) {
                console.error(e);
            }
            scannerRef.current = null;
        }
        setIsScanning(false);
    };

    const startScanner = async () => {
        try {
            setError(null);
            setScanResult(null);
            const scanner = new Html5Qrcode("reader");
            scannerRef.current = scanner;
            setIsScanning(true);
            await scanner.start(
                { facingMode: "environment" },
                { fps: 15, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
                async (text) => {
                    await scanner.stop();
                    await scanner.clear();
                    scannerRef.current = null;
                    setIsScanning(false);
                    handleProcess(text);
                },
                () => { }
            );
        } catch (err) {
            setError("Camera failed. Please check permissions.");
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

    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                const s = scannerRef.current;
                if (s.getState() > 1) {
                    s.stop().catch(() => { }).finally(() => s.clear().catch(() => { }));
                }
            }
        };
    }, []);

    const reset = () => {
        setError(null);
        setScanResult(null);
        setIsScanning(false);
        setManualToken('');
    };

    return (
        <div className="min-h-screen bg-white font-sans p-6">
            <div className="max-w-xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Guest Check-in</h1>
                    <p className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.2em]">Restauranto Terminal</p>
                </div>

                <AnimatePresence mode="wait">
                    {!scanResult && !error && !isVerifying ? (
                        <motion.div
                            key="scanner-ui"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col gap-6"
                        >
                            <div className="relative aspect-square bg-black rounded-3xl overflow-hidden border-2 border-gray-100 shadow-inner">
                                <div id="reader" className="w-full h-full"></div>
                                {!isScanning && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                                        <Scan size={48} className="text-gray-200" />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={isScanning ? shutdownScanner : startScanner}
                                    className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 ${isScanning ? 'bg-gray-900 text-white' : 'bg-orange-500 text-white hover:bg-orange-600'
                                        }`}
                                >
                                    {isScanning ? <><CameraOff size={20} /> Stop Scanner</> : <><Camera size={20} /> Start Scanner</>}
                                </button>

                                <div className="pt-6 border-t border-gray-100 mt-4">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 text-center">Manual Entry</p>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={manualToken}
                                            onChange={(e) => setManualToken(e.target.value)}
                                            placeholder="Paste token ID..."
                                            className="flex-1 px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-orange-500 font-mono text-sm transition-colors"
                                        />
                                        <button
                                            onClick={() => manualToken && handleProcess(manualToken)}
                                            disabled={!manualToken}
                                            className="px-8 py-4 bg-gray-900 text-white font-bold rounded-xl active:scale-95 transition-all disabled:opacity-20"
                                        >
                                            Verify
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : isVerifying ? (
                        <motion.div
                            key="verifying-ui"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="py-32 text-center"
                        >
                            <RefreshCw size={48} className="text-orange-500 animate-spin mx-auto mb-6" />
                            <p className="font-bold text-gray-600 uppercase tracking-widest text-xs">Authenticating...</p>
                        </motion.div>
                    ) : scanResult ? (
                        <motion.div
                            key="success-ui"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white border-2 border-emerald-500 rounded-3xl p-6 space-y-6"
                        >
                            <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                                <CheckCircle size={40} className="text-emerald-500" />
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Verified</h2>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Entry Granted</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Guest Name</p>
                                        <p className="font-bold text-gray-900">{scanResult.name || 'Guest'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Size</p>
                                        <p className="font-bold text-gray-900">{scanResult.guests || 0} People</p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <div className="flex justify-between items-center mb-3">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Pre-order Details</p>
                                        <p className="text-sm font-bold text-gray-900">Total: ₹{(scanResult.totalAmount || 0).toFixed(2)}</p>
                                    </div>

                                    <div className="space-y-2">
                                        {scanResult.preOrders && scanResult.preOrders.length > 0 ? (
                                            scanResult.preOrders.map((item, idx) => {
                                                const quantity = item.qty || item.quantity || 0;
                                                const price = item.priceAtBooking || item.price || 0;
                                                return (
                                                    <div key={idx} className="flex justify-between text-sm bg-gray-50 p-3 rounded-xl">
                                                        <span className="font-bold text-gray-700">{quantity}x {item.name}</span>
                                                        <span className="text-gray-500">₹{(price * quantity).toFixed(2)}</span>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className="text-xs text-center text-gray-400 py-2">No pre-ordered items</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={reset}
                                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all"
                            >
                                Next Guest
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="error-ui"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-8 text-center border-2 border-red-500 rounded-3xl bg-white"
                        >
                            <XCircle className="text-red-500 mx-auto mb-4" size={48} />
                            <h2 className="text-xl font-bold text-gray-900">Invalid Ticket</h2>
                            <p className="text-red-500 text-sm mt-2 font-bold px-4">{error}</p>
                            <button onClick={reset} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold mt-6">Try Again</button>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div id="reader-hidden" className="hidden"></div>
            </div>
        </div>
    );
};

export default Scanner;
