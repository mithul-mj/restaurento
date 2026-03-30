import React from 'react';
import useTicketScanner from '../../hooks/useTicketScanner';

const QRReader = ({ onScanSuccess, onScanError }) => {
    // The hook will now only run when this component (and therefore the 'qr-reader' div) is mounted
    useTicketScanner(onScanSuccess, onScanError);

    return (
        <div className="flex flex-col items-center justify-center p-4 h-full w-full bg-black">
            <div 
                id="qr-reader" 
                className="w-full max-w-sm rounded-[2rem] overflow-hidden bg-black" 
                style={{
                    backgroundColor: 'black',
                    border: 'none',
                    minHeight: '300px'
                }}
            ></div>
            {/* Some CSS overrides to make the html5-qrcode UI look better */}
            <style dangerouslySetInnerHTML={{__html: `
                #qr-reader {
                    border: none !important;
                    background-color: transparent !important;
                    width: 100% !important;
                }
                #qr-reader__scan_region {
                    background: transparent;
                    border-radius: 2rem;
                    overflow: hidden;
                    display: flex;
                    justify-content: center;
                }
                #qr-reader__scan_region video {
                    object-fit: cover !important;
                    border-radius: 2rem !important;
                }
                #qr-reader__dashboard_section_csr button {
                    background-color: #ff5e00 !important;
                    color: white !important;
                    border: none !important;
                    padding: 0.75rem 1.5rem !important;
                    border-radius: 9999px !important;
                    font-weight: bold !important;
                    margin-top: 1rem !important;
                    cursor: pointer;
                }
                #qr-reader__dashboard_section_swaplink {
                   text-decoration: underline !important;
                   color: #ff5e00 !important;
                   margin-top: 0.5rem !important;
                }
            `}} />
        </div>
    );
};

export default QRReader;
