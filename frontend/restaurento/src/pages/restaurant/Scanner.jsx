import React, { useState } from 'react';
import { Camera, CameraOff } from 'lucide-react';
import restaurantService from '../../services/restaurant.service';
import { showToast } from '../../utils/alert';
import QRReader from '../../components/restaurant/QRReader';
import VerifyResult from '../../components/restaurant/VerifyResult';

const Scanner = () => {
    const [scanResult, setScanResult] = useState(null);
    const [error, setError] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [manualToken, setManualToken] = useState('');

    const handleVerifyTicket = async (token) => {
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
            setIsScanning(false);
        }
    };

    const handleScanSuccess = (decodedText) => {
        handleVerifyTicket(decodedText);
    };

    const handleScanError = (errorMessage) => {
        // useTicketScanner filters out basic NotFound errors
        // If an error makes it here, we might want to log it
        if (errorMessage) {
            setError(errorMessage);
            setIsScanning(false);
        }
    };

    const toggleScanner = () => {
        setIsScanning(!isScanning);
        if (!isScanning) {
            setError(null);
            setScanResult(null);
        }
    };

    const reset = () => {
        setError(null);
        setScanResult(null);
        setIsScanning(false);
        setManualToken('');
    };

    return (
        <div className="min-h-screen bg-[#fcfcfc] font-sans p-6">
            <div className="max-w-xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Guest Check-in</h1>
                    <p className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.2em]">Restaurento Terminal</p>
                </div>

                {!scanResult && !error && !isVerifying ? (
                    <div className="space-y-6">
                        {isScanning ? (
                            <div className="bg-black rounded-3xl overflow-hidden border-2 border-gray-100 shadow-xl relative min-h-[300px]">
                                <QRReader onScanSuccess={handleScanSuccess} onScanError={handleScanError} />
                            </div>
                        ) : (
                            <div className="aspect-square bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 p-8 text-center max-w-sm mx-auto shadow-inner">
                                <Camera size={64} className="mb-4 opacity-50 text-orange-500" />
                                <p className="font-bold text-gray-600 text-lg">Scanner Offline</p>
                                <p className="text-xs mt-2 font-medium">Tap below to activate camera</p>
                            </div>
                        )}

                        <div className="space-y-4 pt-4 max-w-md mx-auto">
                            <button
                                onClick={toggleScanner}
                                className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95 ${
                                    isScanning 
                                        ? 'bg-gray-900 text-white hover:bg-black' 
                                        : 'bg-gradient-to-r from-orange-500 to-[#ff5e00] text-white hover:shadow-orange-200 hover:shadow-xl'
                                }`}
                            >
                                {isScanning ? <><CameraOff size={20} /> Stop Scanner</> : <><Camera size={20} /> Activate Camera</>}
                            </button>

                            {!isScanning && (
                                <div className="pt-6 border-t border-gray-100 mt-6 max-w-sm mx-auto">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-4">
                                        <span className="h-px bg-gray-200 flex-1"></span>
                                        Manual Entry
                                        <span className="h-px bg-gray-200 flex-1"></span>
                                    </p>
                                    <div className="flex gap-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                                        <input
                                            type="text"
                                            value={manualToken}
                                            onChange={(e) => setManualToken(e.target.value)}
                                            placeholder="Paste token ID..."
                                            className="flex-1 px-4 py-3 bg-transparent focus:outline-none font-mono text-sm text-gray-700"
                                        />
                                        <button
                                            onClick={() => manualToken && handleVerifyTicket(manualToken)}
                                            disabled={!manualToken}
                                            className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl active:scale-95 transition-all disabled:opacity-20 hover:bg-black"
                                        >
                                            Verify
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <VerifyResult 
                        scanResult={scanResult} 
                        error={error} 
                        isVerifying={isVerifying} 
                        reset={reset} 
                    />
                )}
            </div>
        </div>
    );
};

export default Scanner;
