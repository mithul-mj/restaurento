import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

const useTicketScanner = (onScanSuccess, onScanError) => {
    const scannerRef = useRef(null);
    const hasScannedRef = useRef(false);

    useEffect(() => {
        let isMounted = true;
        
        const startScanner = async () => {
            // Slight delay ensures the DOM element 'qr-reader' is fully painted
            setTimeout(async () => {
                if (!isMounted) return;

                try {
                    const html5QrCode = new Html5Qrcode("qr-reader");
                    scannerRef.current = html5QrCode;

                    // start() automatically requests camera permissions if not granted
                    await html5QrCode.start(
                        { facingMode: "environment" },
                        {
                            fps: 10,
                            qrbox: { width: 250, height: 250 },
                        },
                        (decodedText, decodedResult) => {
                            if (!hasScannedRef.current) {
                                hasScannedRef.current = true;
                                html5QrCode.stop().then(() => {
                                    html5QrCode.clear();
                                }).catch(() => {});
                                onScanSuccess(decodedText, decodedResult);
                            }
                        },
                        (errorMessage) => {
                            // Suppress generic NotFound noise
                            if (errorMessage && !errorMessage.includes("NotFound")) {
                                console.log(errorMessage);
                            }
                        }
                    );
                } catch (err) {
                    console.error("Camera Init Error:", err);
                    if (isMounted) {
                        if (err?.name === 'NotAllowedError' || err?.message?.includes("Permission")) {
                            onScanError && onScanError("Camera access denied. Please grant permissions in your browser settings.");
                        } else {
                            onScanError && onScanError("Camera initialization failed. Ensure you have a working camera.");
                        }
                    }
                }
            }, 100); 
        };

        startScanner();

        return () => {
            isMounted = false;
            if (scannerRef.current) {
                try {
                    scannerRef.current.stop().then(() => {
                        scannerRef.current.clear();
                    }).catch(() => {});
                } catch (error) {
                    console.error("Cleanup error", error);
                }
            }
        };
    }, []);

    const resetScanner = () => {
        hasScannedRef.current = false;
    };

    return { resetScanner };
};

export default useTicketScanner;
